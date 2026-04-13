import nodemailer from "nodemailer";
import { env } from "@pagelist/env/server";

let transporter: nodemailer.Transporter | null = null;
let noReplyTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error("SMTP configuration is not set");
    }

    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function getNoReplyTransporter() {
  if (!noReplyTransporter) {
    // Fall back to default SMTP if dedicated no-reply vars aren't set
    const host = env.NOREPLY_PAGELIST_SMTP_HOST || env.SMTP_HOST;
    const port = env.NOREPLY_PAGELIST_SMTP_PORT || env.SMTP_PORT;
    const user = env.NOREPLY_PAGELIST_SMTP_USER || env.SMTP_USER;
    const pass = env.NOREPLY_PAGELIST_SMTP_PASS || env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      throw new Error("No-reply SMTP configuration is not set");
    }

    noReplyTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return noReplyTransporter;
}

function getNoReplyFrom() {
  return (
    env.NOREPLY_PAGELIST_SMTP_FROM ||
    env.SMTP_FROM ||
    env.NOREPLY_PAGELIST_SMTP_USER ||
    env.SMTP_USER
  );
}

function getVerificationEmailHTML(
  userName: string,
  verificationLink: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; background-color: #E9DFD1; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #F7F3EE; border-radius: 12px; overflow: hidden; border: 1px solid #D8CEC2; }
    .header { background-color: #FFFFFF; padding: 32px 24px; border-bottom: 1px solid #D8CEC2; text-align: center; }
    .logo { font-size: 24px; font-weight: 600; color: #161312; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; }
    .greeting { font-size: 20px; font-weight: 500; color: #161312; margin: 0 0 12px 0; }
    .message { font-size: 15px; color: #4F463F; line-height: 1.6; margin: 0 0 24px 0; }
    .cta-container { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background-color: #D9A826; color: #161312; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: background-color 0.2s; }
    .cta-button:hover { background-color: #BF901D; }
    .expiry { font-size: 12px; color: #7A6F67; text-align: center; margin-top: 16px; }
    .footer { background-color: #EFE7DD; padding: 24px 32px; border-top: 1px solid #D8CEC2; font-size: 12px; color: #7A6F67; text-align: center; }
    .footer-link { color: #D9A826; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Pagelist</div>
    </div>
    <div class="content">
      <h1 class="greeting">Welcome to Pagelist, ${userName}!</h1>
      <p class="message">
        We're excited to have you join our community of readers and writers. To complete your registration, please verify your email address by clicking the button below.
      </p>
      <p class="message">
        This verification link will expire in <strong>5 minutes</strong>.
      </p>
      <div class="cta-container">
        <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
      </div>
      <p class="expiry">This link expires in 5 minutes. If you didn't sign up for a Pagelist account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2026 Pagelist. All rights reserved.</p>
      <p style="margin: 8px 0 0 0;"><a href="https://pagelist.local" class="footer-link">Visit Pagelist</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationToken: string,
  verificationBaseUrl: string,
): Promise<void> {
  const transporter = getTransporter();

  const verificationLink = `${verificationBaseUrl}/verify-email?token=${verificationToken}`;

  const html = getVerificationEmailHTML(userName, verificationLink);

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: userEmail,
    subject: "Verify your Pagelist account",
    html,
    text: `Welcome to Pagelist! Please verify your email by visiting: ${verificationLink}. This link expires in 5 minutes.`,
  });
}

function getPasswordResetEmailHTML(
  userName: string,
  resetLink: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; background-color: #E9DFD1; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #F7F3EE; border-radius: 12px; overflow: hidden; border: 1px solid #D8CEC2; }
    .header { background-color: #FFFFFF; padding: 32px 24px; border-bottom: 1px solid #D8CEC2; text-align: center; }
    .logo { font-size: 24px; font-weight: 600; color: #161312; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; }
    .greeting { font-size: 20px; font-weight: 500; color: #161312; margin: 0 0 12px 0; }
    .message { font-size: 15px; color: #4F463F; line-height: 1.6; margin: 0 0 24px 0; }
    .cta-container { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background-color: #D9A826; color: #161312; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; border: none; cursor: pointer; }
    .expiry { font-size: 12px; color: #7A6F67; text-align: center; margin-top: 16px; }
    .fallback { font-size: 12px; color: #7A6F67; line-height: 1.6; margin-top: 24px; padding-top: 24px; border-top: 1px solid #D8CEC2; }
    .fallback a { color: #D9A826; word-break: break-all; }
    .footer { background-color: #EFE7DD; padding: 24px 32px; border-top: 1px solid #D8CEC2; font-size: 12px; color: #7A6F67; text-align: center; }
    .footer-link { color: #D9A826; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Pagelist</div>
    </div>
    <div class="content">
      <h1 class="greeting">Reset your password, ${userName}</h1>
      <p class="message">
        We received a request to reset the password for your Pagelist account. Click the button below to choose a new password.
      </p>
      <p class="message">
        This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account has not been changed.
      </p>
      <div class="cta-container">
        <a href="${resetLink}" class="cta-button">Reset Password</a>
      </div>
      <p class="expiry">This link expires in 15 minutes.</p>
      <div class="fallback">
        <p style="margin: 0 0 8px 0;">If the button above does not work, copy and paste the following link into your browser:</p>
        <a href="${resetLink}">${resetLink}</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2026 Pagelist. All rights reserved.</p>
      <p style="margin: 8px 0 0 0;"><a href="https://pagelist.local" class="footer-link">Visit Pagelist</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string,
  baseUrl: string,
): Promise<void> {
  const transporter = getTransporter();

  const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;
  const html = getPasswordResetEmailHTML(userName, resetLink);

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: userEmail,
    subject: "Reset your Pagelist password",
    html,
    text: `Hello ${userName},\n\nWe received a request to reset your Pagelist password. Visit the following link to choose a new password:\n\n${resetLink}\n\nThis link expires in 15 minutes. If you did not request this, please ignore this email.`,
  });
}

function getPurchaseReceiptHTML(
  userName: string,
  bookTitle: string,
  amount: number,
  purchaseId: string,
  bookId: string,
  coverUrl: string | null | undefined,
  frontendUrl: string,
): string {
  const readUrl = `${frontendUrl}/reader/book/${bookId}`;
  const formattedAmount = `$${amount.toFixed(2)}`;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const shortOrderId = purchaseId.slice(0, 8).toUpperCase();
  const firstName = userName.split(" ")[0] ?? userName;

  const coverBlock = coverUrl
    ? `<img src="${coverUrl}" alt="${bookTitle}" width="96" height="140" style="width:96px;height:140px;object-fit:cover;border-radius:8px;display:block;box-shadow:0 8px 24px rgba(0,0,0,0.35);" />`
    : `<div style="width:96px;height:140px;border-radius:8px;background:linear-gradient(145deg,#2A4A38,#1B3A2D);display:block;box-shadow:0 8px 24px rgba(0,0,0,0.35);"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pagelist receipt</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#E9DFD1;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E9DFD1;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Outer card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(22,19,18,0.10);">

          <!-- ═══ DARK HEADER ══════════════════════════════════════ -->
          <tr>
            <td style="background-color:#161312;padding:36px 48px 0 48px;text-align:center;">
              <!-- Wordmark -->
              <p style="margin:0;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:#D9A826;">pagelist</p>
              <!-- Divider -->
              <div style="width:32px;height:2px;background-color:#D9A826;margin:16px auto 0 auto;border-radius:1px;"></div>
            </td>
          </tr>

          <!-- ═══ HERO (still dark background) ══════════════════════ -->
          <tr>
            <td style="background-color:#161312;padding:32px 48px 48px 48px;text-align:center;">
              <p style="margin:0 0 14px 0;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#7A6F67;">Order confirmed</p>
              <h1 style="margin:0 0 16px 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:48px;font-weight:400;font-style:italic;color:#F7F3EE;line-height:1.1;">Your book is ready.</h1>
              <p style="margin:0;font-family:'Inter',sans-serif;font-size:15px;color:#C7B9AA;line-height:1.65;">Thank you, ${firstName}. Your purchase was successful<br>and your book is waiting in your library.</p>
            </td>
          </tr>

          <!-- ═══ BOOK SHOWCASE ════════════════════════════════════ -->
          <tr>
            <td style="background-color:#F7F3EE;padding:40px 48px 32px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:14px;border:1px solid #D8CEC2;overflow:hidden;">
                <tr>
                  <!-- Cover -->
                  <td width="136" valign="top" style="padding:28px 0 28px 28px;">
                    ${coverBlock}
                  </td>
                  <!-- Info -->
                  <td valign="middle" style="padding:28px 28px 28px 24px;">
                    <p style="margin:0 0 6px 0;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7A6F67;">Digital Edition</p>
                    <h2 style="margin:0 0 8px 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:600;color:#161312;line-height:1.25;">${bookTitle}</h2>
                    <p style="margin:0 0 24px 0;font-family:'Inter',sans-serif;font-size:13px;color:#7A6F67;">PDF &bull; Unlimited access</p>
                    <a href="${readUrl}" style="display:inline-block;background-color:#D9A826;color:#161312;padding:11px 26px;border-radius:8px;text-decoration:none;font-family:'Inter',sans-serif;font-weight:600;font-size:13px;letter-spacing:0.01em;">Start Reading &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ RECEIPT TABLE ════════════════════════════════════ -->
          <tr>
            <td style="background-color:#F7F3EE;padding:0 48px 32px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D8CEC2;border-radius:12px;overflow:hidden;">
                <!-- Header row -->
                <tr>
                  <td style="background-color:#EFE7DD;padding:11px 18px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4F463F;">Description</td>
                  <td style="background-color:#EFE7DD;padding:11px 18px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4F463F;text-align:right;">Amount</td>
                </tr>
                <!-- Item row -->
                <tr>
                  <td style="background-color:#FFFFFF;padding:16px 18px;font-family:'Inter',sans-serif;font-size:14px;color:#161312;border-top:1px solid #D8CEC2;">${bookTitle}</td>
                  <td style="background-color:#FFFFFF;padding:16px 18px;font-family:'Inter',sans-serif;font-size:14px;color:#161312;border-top:1px solid #D8CEC2;text-align:right;">${formattedAmount}</td>
                </tr>
                <!-- Total row -->
                <tr>
                  <td style="background-color:#F7F3EE;padding:14px 18px;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#161312;border-top:2px solid #C7B9AA;">Total charged</td>
                  <td style="background-color:#F7F3EE;padding:14px 18px;font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:600;color:#161312;border-top:2px solid #C7B9AA;text-align:right;">${formattedAmount}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ ORDER DETAILS ════════════════════════════════════ -->
          <tr>
            <td style="background-color:#F7F3EE;padding:0 48px 40px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFE7DD;border-radius:12px;border:1px solid #D8CEC2;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;color:#7A6F67;padding:5px 0;">Order</td>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#161312;text-align:right;padding:5px 0;letter-spacing:0.06em;">#${shortOrderId}</td>
                      </tr>
                      <tr>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;color:#7A6F67;padding:5px 0;border-top:1px solid #D8CEC2;">Date</td>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#161312;text-align:right;padding:5px 0;border-top:1px solid #D8CEC2;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;color:#7A6F67;padding:5px 0;border-top:1px solid #D8CEC2;">Payment method</td>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#161312;text-align:right;padding:5px 0;border-top:1px solid #D8CEC2;">Paynow</td>
                      </tr>
                      <tr>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;color:#7A6F67;padding:5px 0;border-top:1px solid #D8CEC2;">Access</td>
                        <td style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#161312;text-align:right;padding:5px 0;border-top:1px solid #D8CEC2;">Lifetime</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ DARK FOOTER ══════════════════════════════════════ -->
          <tr>
            <td style="background-color:#161312;padding:28px 48px;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:'Inter',sans-serif;font-size:12px;color:#4F463F;">
                Questions? <a href="${frontendUrl}" style="color:#D9A826;text-decoration:none;">${frontendUrl.replace(/^https?:\/\//, "")}</a>
              </p>
              <p style="margin:0;font-family:'Inter',sans-serif;font-size:11px;color:#4F463F;">© 2026 Pagelist &mdash; All rights reserved</p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendPurchaseReceiptEmail(
  userEmail: string,
  userName: string,
  bookTitle: string,
  amount: number,
  purchaseId: string,
  bookId: string,
  coverUrl?: string | null,
): Promise<void> {
  const noreplyTransporter = getNoReplyTransporter();
  const from = getNoReplyFrom();
  const frontendUrl = env.FRONTEND_URL;
  const shortOrderId = purchaseId.slice(0, 8).toUpperCase();

  const html = getPurchaseReceiptHTML(
    userName,
    bookTitle,
    amount,
    purchaseId,
    bookId,
    coverUrl,
    frontendUrl,
  );

  await noreplyTransporter.sendMail({
    from: from ? `Pagelist <${from}>` : "Pagelist",
    to: userEmail,
    subject: `Your receipt — "${bookTitle}"`,
    html,
    text: [
      `Hi ${userName},`,
      ``,
      `Thank you for your purchase!`,
      ``,
      `"${bookTitle}" — $${amount.toFixed(2)}`,
      `Order #${shortOrderId} · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      ``,
      `Start reading: ${frontendUrl}/reader/book/${bookId}`,
      ``,
      `— Pagelist`,
    ].join("\n"),
  });
}
