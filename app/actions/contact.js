"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SUPPORT_EMAIL =
  process.env.RESEND_SUPPORT_EMAIL || "aboderindaniel482@gmail.com";

/**
 * Sends an internal notification to the support team
 */
function generateInternalEmailHTML({ name, email, phone, subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

        <tr>
          <td style="background:linear-gradient(135deg,#14532D 0%,#166534 100%);padding:32px 40px;">
            <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;">📬 New Contact Message</h1>
            <p style="margin:8px 0 0;color:#D1FAE5;font-size:14px;">Received via https://farz-supplements.vercel.app/contact</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:24px;margin-bottom:28px;">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#166534;width:120px;">Name</td>
                <td style="padding:6px 0;font-size:15px;font-weight:600;color:#111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#166534;">Email</td>
                <td style="padding:6px 0;font-size:15px;color:#111827;">
                  <a href="mailto:${email}" style="color:#14532D;font-weight:600;">${email}</a>
                </td>
              </tr>
              ${
                phone
                  ? `
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#166534;">Phone</td>
                <td style="padding:6px 0;font-size:15px;color:#111827;">${phone}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#166534;">Subject</td>
                <td style="padding:6px 0;font-size:15px;color:#111827;">${subject}</td>
              </tr>
            </table>

            <h3 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#111827;">Message</h3>
            <div style="background:#F9FAFB;border-left:4px solid #14532D;border-radius:4px;padding:20px;font-size:15px;line-height:24px;color:#374151;white-space:pre-wrap;">${message}</div>

            <div style="margin-top:32px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                 style="display:inline-block;background:#14532D;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;">
                Reply to ${name}
              </a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:13px;color:#9CA3AF;">© ${new Date().getFullYear()} Farz Supplements</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Sends an auto-reply to the person who submitted the form
 */
function generateAutoReplyHTML({ name, subject }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

        <tr>
          <td style="background:linear-gradient(135deg,#14532D 0%,#166534 100%);padding:40px;text-align:center;">
            <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:700;">🌿 Farz Supplements</h1>
            <p style="margin:12px 0 0;color:#D1FAE5;font-size:16px;">We've received your message</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">
              Thank you, ${name}!
            </h2>
            <p style="margin:0 0 20px;font-size:16px;line-height:26px;color:#6B7280;">
              We've received your message about <strong style="color:#111827;">"${subject}"</strong> and our team will get back to you within <strong style="color:#14532D;">24–48 hours</strong>.
            </p>
            <p style="margin:0 0 32px;font-size:16px;line-height:26px;color:#6B7280;">
              If your matter is urgent, feel free to call us directly at
              <a href="tel:+2349123368239" style="color:#14532D;font-weight:600;">+2349123368239</a>.
            </p>

            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:14px;color:#166534;font-weight:600;">Our business hours</p>
              <p style="margin:0;font-size:14px;color:#166534;line-height:22px;">
                Monday – Friday: 8am – 6pm<br/>
                Saturday: 9am – 4pm
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#F9FAFB;padding:28px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0 0 6px;font-size:13px;color:#9CA3AF;">© ${new Date().getFullYear()} Farz Supplements. All rights reserved.</p>
            <p style="margin:0;font-size:12px;color:#D1D5DB;">Natural health supplements for wellness</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Server action — called directly from the contact form
 */
export async function sendContactEmail(formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  // Basic server-side validation
  if (!name || !email || !subject || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (message.length < 10) {
    return { success: false, error: "Message is too short." };
  }

  try {
    // Send both emails concurrently
    await Promise.all([
      // 1. Notify the support team
      resend.emails.send({
        from: FROM_EMAIL,
        to: SUPPORT_EMAIL,
        replyTo: email,
        subject: `[Contact] ${subject} — from ${name}`,
        html: generateInternalEmailHTML({
          name,
          email,
          phone,
          subject,
          message,
        }),
      }),

      // 2. Auto-reply to the sender
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        replyTo: SUPPORT_EMAIL,
        subject: `We received your message — Farz Supplements`,
        html: generateAutoReplyHTML({ name, subject }),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Contact form email error:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again or call us directly.",
    };
  }
}
