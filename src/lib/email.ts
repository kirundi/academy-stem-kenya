import { Resend } from "resend";

const FROM_EMAIL = "STEM Impact Academy <noreply@stemimpactcenterkenya.org>";
const BCC_EMAIL = "executivedirector@stemimpactcenterkenya.org";
const PLATFORM_URL = "https://academy.stemimpactcenterkenya.org";

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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Hello, ${params.name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
            <strong>${params.inviterName}</strong> has invited you to join the STEM Impact Academy platform as a <strong>${roleLabel}</strong>.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Click the button below to accept your invitation and set your own password. This link expires in <strong>48 hours</strong>.
          </p>
          <a href="${params.inviteLink}" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Accept Invitation
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link:<br/>
            <span style="color: #475569; font-size: 12px; font-family: monospace; word-break: break-all;">${params.inviteLink}</span>
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Welcome, ${params.name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            You have been invited to join the STEM Impact Academy platform as a <strong>${roleLabel}</strong>.
          </p>
          <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Email</p>
            <p style="color: #10221c; font-size: 15px; font-family: monospace; margin: 0 0 16px;">${params.to}</p>
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Temporary Password</p>
            <p style="color: #13eca4; font-size: 18px; font-family: monospace; font-weight: bold; margin: 0;">${params.tempPassword}</p>
          </div>
          <a href="${PLATFORM_URL}/login" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
            Log In to Your Account
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            Please change your password after your first login.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Platform Initialized</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Hello, ${params.name}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            The STEM Impact Academy platform has been initialized. Here are your super admin credentials:
          </p>
          <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Email</p>
            <p style="color: #10221c; font-size: 15px; font-family: monospace; margin: 0 0 16px;">${params.to}</p>
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Temporary Password</p>
            <p style="color: #13eca4; font-size: 18px; font-family: monospace; font-weight: bold; margin: 0;">${params.tempPassword}</p>
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
}

export async function sendPasswordResetEmail(params: { to: string; oobCode: string }) {
  const resetUrl = `${PLATFORM_URL}/reset-password?oobCode=${encodeURIComponent(params.oobCode)}`;

  await sendEmail({
    from: FROM_EMAIL,
    to: params.to,
    bcc: BCC_EMAIL,
    subject: "Reset your STEM Impact Academy password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset the password for your account. Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 12px;">Hello, ${adminName}</h2>
          ${
            isApproved
              ? `
            <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; border: 1px solid #a7f3d0; margin-bottom: 20px;">
              <p style="color: #065f46; font-size: 15px; font-weight: 600; margin: 0;">
                🎉 Your school has been approved!
              </p>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              <strong>${schoolName}</strong> has been approved and your administrator account is now active.
              Sign in to access your dashboard and start inviting teachers.
            </p>
            <a href="${PLATFORM_URL}/login" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
              Access Your Dashboard
            </a>
          `
              : `
            <div style="background: #fef2f2; border-radius: 8px; padding: 16px; border: 1px solid #fecaca; margin-bottom: 20px;">
              <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0;">
                Application Not Approved
              </p>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              We were unable to approve the application for <strong>${schoolName}</strong> at this time.
            </p>
            ${
              reason
                ? `
            <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px;">Reason</p>
              <p style="color: #10221c; font-size: 14px; margin: 0;">${reason}</p>
            </div>
            `
                : ""
            }
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              If you have questions or wish to re-apply, please contact our team.
            </p>
            <a href="mailto:support@stemimpactcenterkenya.org" style="display: inline-block; background: #10221c; color: #fff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
              Contact Support
            </a>
          `
          }
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Hello, ${params.name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
            You've started registering <strong>${params.schoolName}</strong> on the STEM Impact Academy platform but haven't submitted your application yet.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Click the button below to return to the review step and submit your application. Your progress has been saved.
          </p>
          <a href="${params.resumeLink}" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Complete Registration
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            This link expires in <strong>72 hours</strong>. If the button doesn't work, copy and paste this URL:<br/>
            <span style="color: #475569; font-size: 12px; font-family: monospace; word-break: break-all;">${params.resumeLink}</span>
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">
            If you did not start this registration, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="background: #fef3c7; border-radius: 8px; padding: 14px 16px; border: 1px solid #fde68a; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0;">Your registration is still incomplete</p>
          </div>
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Hello, ${params.name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
            We noticed you started registering <strong>${params.schoolName}</strong> but haven't submitted your application yet.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Your saved details are ready — it only takes a moment to complete. This link will expire soon.
          </p>
          <a href="${params.resumeLink}" style="display: inline-block; background: #13eca4; color: #10221c; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Complete My Registration
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
            If the button doesn't work, copy and paste this URL:<br/>
            <span style="color: #475569; font-size: 12px; font-family: monospace; word-break: break-all;">${params.resumeLink}</span>
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #10221c; font-size: 24px; margin: 0;">STEM Impact Academy</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Kenya</p>
        </div>
        <div style="background: #f8fafb; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10221c; font-size: 20px; margin: 0 0 8px;">Welcome, ${params.adminName}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            Thank you for registering <strong>${params.schoolName}</strong> on the STEM Impact Academy platform.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            A Global Administrator is reviewing your application. You will receive a confirmation email once your school has been approved. This typically takes 24–48 hours.
          </p>
          <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; border: 1px solid #a7f3d0;">
            <p style="color: #065f46; font-size: 14px; margin: 0;"><strong>What happens next?</strong></p>
            <ul style="color: #065f46; font-size: 13px; margin: 8px 0 0; padding-left: 20px; line-height: 1.8;">
              <li>Your application is reviewed by our team</li>
              <li>You receive approval and dashboard access</li>
              <li>Start inviting teachers and creating classes</li>
            </ul>
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} STEM Impact Center Kenya &middot; stemimpactcenterkenya.org
        </p>
      </div>
    `,
  });
}
