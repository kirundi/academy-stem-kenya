import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/api-auth";
import { baseTemplate, ctaButton } from "@/lib/email";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";

const FROM_EMAIL = "STEM Impact Academy <noreply@stemimpactcenterkenya.org>";
const PLATFORM_URL = "https://academy.stemimpactcenterkenya.org";
const CHUNK_SIZE = 50; // send in batches to avoid timeout

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * POST /api/admin/broadcast
 *
 * Body:
 *   subject   string         — email subject line
 *   message   string         — plain-text body (rendered in branded template)
 *   audience  object         — filter: { roles?, schoolIds?, status? }
 *   dryRun    boolean        — if true: return recipient count only, no emails sent
 *
 * Requires admin or super_admin role.
 */
export async function POST(req: NextRequest) {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const {
    subject,
    message,
    audience = {},
    dryRun = false,
  } = body as {
    subject: string;
    message: string;
    audience: { roles?: string[]; schoolIds?: string[]; status?: string };
    dryRun?: boolean;
  };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  // Build query — Firestore 'in' supports max 10 values
  const rolesFilter = audience.roles?.slice(0, 10);
  let query = adminDb.collection("users") as FirebaseFirestore.Query;

  if (rolesFilter?.length) {
    query = query.where("role", "in", rolesFilter);
  }
  if (audience.status) {
    query = query.where("status", "==", audience.status);
  }

  const snap = await query.get();

  // Filter by schoolIds in memory (avoids multi-field compound index requirement)
  let docs = snap.docs;
  if (audience.schoolIds?.length) {
    docs = docs.filter((d) => audience.schoolIds!.includes(d.data().schoolId ?? ""));
  }

  const recipients = docs
    .map((d) => ({
      uid: d.id,
      name: (d.data().displayName as string) || "User",
      email: d.data().email as string,
      role: d.data().role as string,
    }))
    .filter((r) => !!r.email);

  // Dry run — return count and preview list only
  if (dryRun) {
    return NextResponse.json({
      count: recipients.length,
      recipients: recipients.slice(0, 20), // preview first 20
    });
  }

  if (!recipients.length) {
    return NextResponse.json(
      { error: "No recipients matched the selected audience." },
      { status: 400 }
    );
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const resend = new Resend(key);

  const html = baseTemplate(`
    <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 20px;">${escHtml(subject)}</h2>
    <div style="color:#475569;font-size:15px;line-height:1.85;white-space:pre-wrap;margin:0 0 28px;">${escHtml(message)}</div>
    ${ctaButton(`${PLATFORM_URL}/dashboard`, "Go to Your Dashboard")}
    <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
      You received this message because you are a registered user of the STEM Impact Academy platform.
    </p>
  `);

  let sent = 0;
  const errors: string[] = [];

  // Send in chunks of CHUNK_SIZE
  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (r) => {
        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: r.email,
            subject,
            html,
          });
          if (error) errors.push(r.email);
          else sent++;
        } catch {
          errors.push(r.email);
        }
      })
    );
  }

  // Audit log
  await adminDb.collection("broadcast_logs").add({
    subject,
    message,
    audience,
    sentBy: caller.uid,
    sentByEmail: caller.email ?? "",
    recipientCount: sent,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors : [],
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    sent,
    failed: errors.length,
    message: `Sent to ${sent} recipient(s).`,
    ...(errors.length > 0 ? { errors } : {}),
  });
}

/**
 * GET /api/admin/broadcast
 * Returns the last 20 broadcast log entries.
 */
export async function GET() {
  const caller = await requireAdmin();
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const snap = await adminDb
    .collection("broadcast_logs")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  const logs = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
  }));

  return NextResponse.json({ logs });
}
