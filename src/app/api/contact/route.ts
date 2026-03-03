import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

  const resend = new Resend(key);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: CONTACT_EMAIL,
    bcc: BCC_EMAIL,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
        <h2 style="color: #10221c; margin: 0 0 16px;">New contact form submission</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 80px;">Name</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Subject</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${subject}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f8fafb; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ status: "ok" });
}
