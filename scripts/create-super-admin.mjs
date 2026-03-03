/**
 * Creates (or resets) the super admin account directly via Firebase Admin SDK.
 * Run: node scripts/create-super-admin.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed
    .slice(eq + 1)
    .trim()
    .replace(/^"|"$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

// ── Firebase Admin init ──────────────────────────────────────────────────────
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ── Create super admin ───────────────────────────────────────────────────────
const email = "magu@stemimpactcenterkenya.org";
const displayName = "Alex Magu";
const tempPassword = crypto.randomBytes(6).toString("base64url");

let uid;

try {
  const existing = await auth.getUserByEmail(email);
  uid = existing.uid;
  await auth.updateUser(uid, { password: tempPassword, displayName });
  console.log("Existing Firebase Auth user found — password reset.");
} catch {
  const user = await auth.createUser({ email, password: tempPassword, displayName });
  uid = user.uid;
  console.log("New Firebase Auth user created.");
}

await db.collection("users").doc(uid).set({
  email,
  displayName,
  role: "super_admin",
  schoolId: null,
  requiresPasswordChange: true,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});

await auth.setCustomUserClaims(uid, { role: "super_admin", schoolId: null });

// ── Send credentials email via Resend ────────────────────────────────────────
const resendKey = process.env.RESEND_API_KEY;
if (resendKey) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const PLATFORM_URL = "https://academy.stemimpactcenterkenya.org";
    await resend.emails.send({
      from: "STEM Impact Academy <noreply@stemimpactcenterkenya.org>",
      to: email,
      bcc: "executivedirector@stemimpactcenterkenya.org",
      subject: "Your STEM Impact Academy Super Admin Credentials",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Platform Initialized</p>
          </div>
          <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Hello, ${displayName}</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              The STEM Impact Academy platform has been initialized. Here are your super admin credentials:
            </p>
            <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Email</p>
              <p style="color: #10221c; font-size: 15px; font-family: monospace; margin: 0 0 16px;">${email}</p>
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Temporary Password</p>
              <p style="color: #13eca4; font-size: 18px; font-family: monospace; font-weight: bold; margin: 0;">${tempPassword}</p>
            </div>
            <a href="${PLATFORM_URL}/login" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
              Log In Now
            </a>
            <div style="background: #fef3c7; border-radius: 8px; padding: 12px 16px; margin-top: 20px; border: 1px solid #fde68a;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                <strong>Important:</strong> Change this password immediately after your first login.
              </p>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
          </p>
        </div>
      `,
    });
    console.log("  Email:     Credentials sent to", email);
  } catch (emailErr) {
    console.warn("  Email:     Failed to send credentials email:", emailErr.message);
  }
} else {
  console.warn("  Email:     RESEND_API_KEY not set — credentials email skipped.");
}

console.log("\n✓ Super admin ready.");
console.log("  Email:    ", email);
console.log("  Password: ", tempPassword);
console.log("\nLog in at: https://academy.stemimpactcenterkenya.org/login?mode=email");
console.log("You will be prompted to change your password on first login.\n");
