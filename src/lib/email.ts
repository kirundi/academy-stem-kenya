import { Resend } from "resend";

const FROM_EMAIL = "STEM Impact Academy <noreply@stemimpactcenterkenya.org>";
const BCC_EMAIL = "executivedirector@stemimpactcenterkenya.org";
const PLATFORM_URL = "https://academy.stemimpactcenterkenya.org";

const LOGO_ACADEMY = `${PLATFORM_URL}/images/logo/sic-academy.png`;
const LOGO_SIC = `${PLATFORM_URL}/images/logo/sic-logo.png`;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

/** Resend v3+ returns { data, error } instead of throwing. Throw if error is present. */
async function sendEmail(...args: Parameters<ReturnType<typeof getResend>["emails"]["send"]>) {
  const { data, error } = await getResend().emails.send(...args);
  if (error) throw new Error(`Resend error: ${error.message ?? JSON.stringify(error)}`);
  return data;
}

// ---------------------------------------------------------------------------
// Shared base template
// ---------------------------------------------------------------------------

/**
 * Wraps arbitrary HTML body content in the branded email shell:
 *   - Dark green header with sic-academy.png (white-pill background)
 *   - White card body with teal accent bar
 *   - Light footer with "Powered by sic-logo.png"
 */
export function baseTemplate(body: string): string {
  const year = new Date().getFullYear();
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:#10221c;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <img
                src="${LOGO_ACADEMY}"
                alt="STEM Impact Academy"
                width="200"
                style="height:48px;width:auto;background:#ffffff;padding:8px 16px;border-radius:8px;display:inline-block;"
              />
            </td>
          </tr>

          <!-- ── Body card ── -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <!-- teal accent bar -->
              <div style="width:40px;height:4px;background:#13eca4;border-radius:2px;margin-bottom:28px;"></div>
              ${body}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:24px 32px;border:1px solid #e2e8f0;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px;">Powered by</p>
              <img
                src="${LOGO_SIC}"
                alt="STEM Impact Center Kenya"
                width="160"
                style="height:36px;width:auto;background:#ffffff;padding:6px 12px;border-radius:6px;border:1px solid #e2e8f0;display:inline-block;"
              />
              <p style="color:#94a3b8;font-size:11px;margin:14px 0 0;line-height:1.6;">
                &copy; ${year} STEM Impact Center Kenya &middot;
                <a href="https://stemimpactcenterkenya.org" style="color:#64748b;text-decoration:none;">stemimpactcenterkenya.org</a>
              </p>
              <p style="color:#cbd5e1;font-size:10px;margin:6px 0 0;">
                This email was sent from a no-reply address. Do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reusable HTML snippets
// ---------------------------------------------------------------------------

function ctaButton(href: string, label: string, color = "#13eca4", textColor = "#10221c") {
  return `<a href="${href}" style="display:inline-block;background:${color};color:${textColor};font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;margin-top:4px;">${label}</a>`;
}

function fallbackLink(href: string) {
  return `<p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">If the button doesn't work, copy and paste this link:<br/><span style="color:#475569;font-size:11px;font-family:monospace;word-break:break-all;">${href}</span></p>`;
}

function statusBadge(type: "success" | "warning" | "error" | "info", message: string) {
  const styles = {
    success: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    warning: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
    error:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  };
  const s = styles[type];
  return `<div style="background:${s.bg};border-radius:8px;padding:14px 18px;border:1px solid ${s.border};margin-bottom:24px;">
    <p style="color:${s.text};font-size:14px;font-weight:600;margin:0;">${message}</p>
  </div>`;
}

function credentialRow(label: string, value: string, mono = false) {
  return `<div style="margin-bottom:14px;">
    <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">${label}</p>
    <p style="color:#10221c;font-size:15px;${mono ? "font-family:monospace;" : ""}font-weight:600;margin:0;">${value}</p>
  </div>`;
}

function credentialsCard(...rows: string[]) {
  return `<div style="background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #e2e8f0;margin-bottom:28px;">${rows.join("")}</div>`;
}

function stepsList(steps: string[]) {
  const items = steps.map(s => `<li style="color:#065f46;font-size:13px;line-height:1.9;">${s}</li>`).join("");
  return `<ul style="color:#065f46;font-size:13px;margin:8px 0 0;padding-left:20px;line-height:1.9;">${items}</ul>`;
}

// ---------------------------------------------------------------------------
// Email functions
// ---------------------------------------------------------------------------

/**
 * Sends a secure invite link (no password in email).
 * The recipient sets their own password at /accept-invite.
 */
export async function sendInviteTokenEmail(params: {
  to: string;
  name: string;
  role: string;
  inviteLink: string;
  inviterName: string;
}) {
  const roleLabel = params.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: `You've been invited to STEM Impact Academy as ${roleLabel}`,
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Hello, ${params.name}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 6px;">
        <strong>${params.inviterName}</strong> has invited you to join the STEM Impact Academy platform as a <strong style="color:#10221c;">${roleLabel}</strong>.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Click the button below to accept your invitation and set your own password. This link expires in <strong>48 hours</strong>.
      </p>
      ${ctaButton(params.inviteLink, "Accept Invitation")}
      ${fallbackLink(params.inviteLink)}
      <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;">
        If you weren't expecting this invitation, you can safely ignore this email.
      </p>
    `),
  });
}

/** @deprecated Use sendInviteTokenEmail instead. Kept for the super-admin setup flow only. */
export async function sendInviteEmail(params: {
  to: string;
  name: string;
  role: string;
  tempPassword: string;
}) {
  const roleLabel = params.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: `You've been invited to STEM Impact Academy as ${roleLabel}`,
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Welcome, ${params.name}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
        You have been invited to join the STEM Impact Academy platform as a <strong style="color:#10221c;">${roleLabel}</strong>.
        Use the credentials below to log in.
      </p>
      ${credentialsCard(
        credentialRow("Email", params.to, true),
        credentialRow("Temporary Password", params.tempPassword, true),
      )}
      ${ctaButton(`${PLATFORM_URL}/login`, "Log In to Your Account")}
      <p style="color:#94a3b8;font-size:13px;margin-top:20px;">Please change your password after your first login.</p>
    `),
  });
}

export async function sendSetupCredentialsEmail(params: {
  to: string;
  name: string;
  tempPassword: string;
}) {
  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: "Your STEM Impact Academy Super Admin Credentials",
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Platform Initialized</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hello, <strong>${params.name}</strong>. The STEM Impact Academy platform has been set up.
        Here are your super admin credentials:
      </p>
      ${credentialsCard(
        credentialRow("Email", params.to, true),
        credentialRow("Temporary Password", params.tempPassword, true),
      )}
      ${ctaButton(`${PLATFORM_URL}/login`, "Log In Now")}
      ${statusBadge("warning", "⚠️ Important: Change this password immediately after your first login.")}
    `),
  });
}

export async function sendPasswordResetEmail(params: { to: string; oobCode: string }) {
  const resetUrl = `${PLATFORM_URL}/reset-password?oobCode=${encodeURIComponent(params.oobCode)}`;

  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: "Reset your STEM Impact Academy password",
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Password Reset Request</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
        We received a request to reset the password for your account.
        Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
      </p>
      ${ctaButton(resetUrl, "Reset My Password")}
      ${fallbackLink(resetUrl)}
      <p style="color:#94a3b8;font-size:13px;margin-top:16px;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not be changed.
      </p>
    `),
  });
}

/**
 * Emails the school admin when their application is approved or rejected.
 */
export async function sendSchoolDecisionEmail(
  to: string,
  schoolName: string,
  adminName: string,
  decision: "approved" | "rejected",
  reason?: string
) {
  const isApproved = decision === "approved";

  await sendEmail({
    from: FROM_EMAIL,
    to,
    bcc: BCC_EMAIL,
    subject: isApproved
      ? `${schoolName} has been approved — STEM Impact Academy`
      : `Update on your ${schoolName} application`,
    html: baseTemplate(
      isApproved
        ? `
          <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Hello, ${adminName}</h2>
          ${statusBadge("success", "🎉 Your school has been approved!")}
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
            <strong>${schoolName}</strong> is now active on the STEM Impact Academy platform.
            Sign in to access your administrator dashboard and start inviting teachers.
          </p>
          ${ctaButton(`${PLATFORM_URL}/login`, "Access Your Dashboard")}
        `
        : `
          <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Hello, ${adminName}</h2>
          ${statusBadge("error", "Application Not Approved")}
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
            We were unable to approve the application for <strong>${schoolName}</strong> at this time.
          </p>
          ${reason ? credentialsCard(credentialRow("Reason", reason)) : ""}
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
            If you have questions or would like to re-apply, please reach out to our support team.
          </p>
          ${ctaButton("mailto:support@stemimpactcenterkenya.org", "Contact Support", "#10221c", "#ffffff")}
        `
    ),
  });
}

/**
 * Sent immediately when a draft is saved (step 2 → step 3 transition).
 * Gives the user a resume link valid for 72 hours.
 */
export async function sendRegistrationDraftEmail(params: {
  to: string;
  name: string;
  schoolName: string;
  resumeLink: string;
}) {
  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: `Complete your STEM Impact Academy registration — ${params.schoolName}`,
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Hello, ${params.name}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 8px;">
        You've started registering <strong>${params.schoolName}</strong> on the STEM Impact Academy platform but haven't submitted your application yet.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your progress has been saved. Click below to return to the review step and submit. This link expires in <strong>72 hours</strong>.
      </p>
      ${ctaButton(params.resumeLink, "Complete Registration")}
      ${fallbackLink(params.resumeLink)}
      <p style="color:#94a3b8;font-size:13px;margin-top:16px;">
        If you did not start this registration, you can safely ignore this email.
      </p>
    `),
  });
}

/**
 * Reminder sent ~24h after draft creation if the user still hasn't submitted.
 */
export async function sendDraftReminderEmail(params: {
  to: string;
  name: string;
  schoolName: string;
  resumeLink: string;
}) {
  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: `Reminder: your ${params.schoolName} registration is incomplete`,
    html: baseTemplate(`
      ${statusBadge("warning", "⏰ Your registration is still incomplete")}
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Hello, ${params.name}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 8px;">
        We noticed you started registering <strong>${params.schoolName}</strong> but haven't submitted your application yet.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your saved details are ready — it only takes a moment to complete. This link will expire soon.
      </p>
      ${ctaButton(params.resumeLink, "Complete My Registration")}
      ${fallbackLink(params.resumeLink)}
    `),
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  schoolName: string;
  adminName: string;
}) {
  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: `Welcome to STEM Impact Academy — ${params.schoolName}`,
    html: baseTemplate(`
      <h2 style="color:#10221c;font-size:22px;font-weight:800;margin:0 0 8px;">Welcome, ${params.adminName}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Thank you for registering <strong>${params.schoolName}</strong> on the STEM Impact Academy platform.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
        A Global Administrator is reviewing your application. You will receive a confirmation email once approved — this typically takes <strong>24–48 hours</strong>.
      </p>
      <div style="background:#ecfdf5;border-radius:10px;padding:20px 24px;border:1px solid #a7f3d0;">
        <p style="color:#065f46;font-size:14px;font-weight:700;margin:0 0 8px;">What happens next?</p>
        ${stepsList([
          "Your application is reviewed by our team",
          "You receive an approval email with dashboard access",
          "Start inviting teachers and creating classrooms",
          "Students begin their STEM learning journey",
        ])}
      </div>
    `),
  });
}
