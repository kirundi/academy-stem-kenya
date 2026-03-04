import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { baseTemplate } from "@/lib/email";

const CONTACT_EMAIL = "programs@stemimpactcenterkenya.org";
const BCC_EMAIL = "executivedirector@stemimpactcenterkenya.org";
const FROM_EMAIL = "STEM Impact Academy <noreply@stemimpactcenterkenya.org>";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { name, email, subject, message } = body as Record<string, string>;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY not set — contact form submission dropped");
    return NextResponse.json({ status: "ok" });
  }

  // Escape HTML to prevent injection in the email body
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: CONTACT_EMAIL,
    bcc: BCC_EMAIL,
    replyTo: email,
    subject: `Contact Form: ${esc(subject)}`,
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">New Contact Message</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
        A visitor submitted the contact form on the STEM Impact Academy website.
      </p>
      <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #e2e8f0;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;width:90px;vertical-align:top;">Name</td>
            <td style="padding:8px 0;color:#10221c;font-weight:600;">${esc(name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">Email</td>
            <td style="padding:8px 0;color:#10221c;font-weight:600;"><a href="mailto:${esc(email)}" style="color:#13eca4;text-decoration:none;">${esc(email)}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">Subject</td>
            <td style="padding:8px 0;color:#10221c;font-weight:600;">${esc(subject)}</td>
          </tr>
        </table>
      </div>
      <div style="background:#f0fdf4;border-radius:10px;padding:20px 24px;border:1px solid #bbf7d0;">
        <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Message</p>
        <p style="color:#1e293b;font-size:14px;line-height:1.8;margin:0;white-space:pre-wrap;">${esc(message)}</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;">
        Reply directly to this email to respond to ${esc(name)}.
      </p>
    `),
  });

  if (error) {
    console.error("Contact form email failed:", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
