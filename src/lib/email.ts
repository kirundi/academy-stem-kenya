import { Resend } from "resend";

const FROM_EMAIL = "STEM Impact Academy <noreply@stemimpactcenterkenya.org>";
const PLATFORM_URL = "https://academy.stemimpactcenterkenya.org";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendInviteEmail(params: {
  to: string;
  name: string;
  role: string;
  tempPassword: string;
}) {
  const roleLabel = params.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
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
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
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

export async function sendWelcomeEmail(params: {
  to: string;
  schoolName: string;
  adminName: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
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
