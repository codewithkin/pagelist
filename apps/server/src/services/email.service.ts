import nodemailer from "nodemailer";
import { env } from "@pagelist/env/server";

let transporter: nodemailer.Transporter | null = null;

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
  const displayName = userName.split(" ")[0] ?? userName;

  const coverBlock = coverUrl
    ? `<img src="${coverUrl}" alt="${bookTitle}" width="80" height="120" style="width:80px;height:120px;object-fit:cover;border-radius:6px;display:block;border:1px solid #D8CEC2;" />`
    : `<div style="width:80px;height:120px;border-radius:6px;background-color:#1B3A2D;display:inline-block;vertical-align:top;"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your receipt from Pagelist</title>
</head>
<body style="margin:0;padding:0;background-color:#E9DFD1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Inter',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E9DFD1;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#F7F3EE;border-radius:16px;border:1px solid #D8CEC2;">
          <tr>
            <td>

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#FFFFFF;padding:28px 40px;border-bottom:1px solid #D8CEC2;border-radius:16px 16px 0 0;text-align:center;">
                    <span style="font-size:22px;font-weight:600;color:#161312;letter-spacing:-0.5px;">pagelist</span>
                  </td>
                </tr>
                <!-- Gold rule -->
                <tr>
                  <td style="height:3px;background-color:#D9A826;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:44px 40px 32px 40px;text-align:center;">
                    <p style="margin:0 0 10px 0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#D9A826;">Purchase Confirmed</p>
                    <h1 style="margin:0 0 12px 0;font-size:36px;font-weight:400;color:#161312;line-height:1.2;font-family:Georgia,'Times New Roman',serif;">Your book is ready.</h1>
                    <p style="margin:0;font-size:15px;color:#4F463F;line-height:1.6;">Thank you, ${displayName}. Your order is confirmed and your book is waiting.</p>
                  </td>
                </tr>
              </table>

              <!-- Book block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 40px 32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;border:1px solid #D8CEC2;border-radius:12px;">
                      <tr>
                        <td width="104" valign="top" style="padding:24px 0 24px 24px;">
                          ${coverBlock}
                        </td>
                        <td valign="middle" style="padding:24px;">
                          <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7A6F67;">Digital Book</p>
                          <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:500;color:#161312;line-height:1.3;font-family:Georgia,'Times New Roman',serif;">${bookTitle}</h2>
                          <a href="${readUrl}" style="display:inline-block;background-color:#D9A826;color:#161312;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">Start Reading &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Receipt table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 40px 32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #D8CEC2;border-radius:10px;overflow:hidden;">
                      <tr style="background-color:#EFE7DD;">
                        <td style="padding:10px 16px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4F463F;">Item</td>
                        <td style="padding:10px 16px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4F463F;text-align:right;">Amount</td>
                      </tr>
                      <tr style="background-color:#FFFFFF;">
                        <td style="padding:14px 16px;font-size:14px;color:#161312;border-top:1px solid #D8CEC2;">${bookTitle}</td>
                        <td style="padding:14px 16px;font-size:14px;color:#161312;border-top:1px solid #D8CEC2;text-align:right;">${formattedAmount}</td>
                      </tr>
                      <tr style="background-color:#F7F3EE;">
                        <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#161312;border-top:1px solid #D8CEC2;">Total</td>
                        <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#161312;border-top:1px solid #D8CEC2;text-align:right;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Order metadata -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 40px 40px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EFE7DD;border-radius:10px;">
                      <tr>
                        <td style="padding:16px 16px 8px 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size:12px;color:#7A6F67;padding:6px 0;">Order number</td>
                              <td style="font-size:12px;color:#161312;font-weight:500;text-align:right;padding:6px 0;">#${shortOrderId}</td>
                            </tr>
                            <tr>
                              <td style="font-size:12px;color:#7A6F67;padding:6px 0;border-top:1px solid #D8CEC2;">Date</td>
                              <td style="font-size:12px;color:#161312;font-weight:500;text-align:right;padding:6px 0;border-top:1px solid #D8CEC2;">${orderDate}</td>
                            </tr>
                            <tr>
                              <td style="font-size:12px;color:#7A6F67;padding:6px 0 8px 0;border-top:1px solid #D8CEC2;">Payment</td>
                              <td style="font-size:12px;color:#161312;font-weight:500;text-align:right;padding:6px 0 8px 0;border-top:1px solid #D8CEC2;">Paynow</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#EFE7DD;padding:24px 40px;border-top:1px solid #D8CEC2;border-radius:0 0 16px 16px;text-align:center;">
                    <p style="margin:0 0 6px 0;font-size:12px;color:#7A6F67;">© 2026 Pagelist. All rights reserved.</p>
                    <p style="margin:0;font-size:12px;color:#7A6F67;">Questions? Visit <a href="${frontendUrl}" style="color:#D9A826;text-decoration:none;">${frontendUrl.replace(/^https?:\/\//, "")}</a></p>
                  </td>
                </tr>
              </table>

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
  const transporter = getTransporter();
  const frontendUrl = env.FRONTEND_URL;
  const shortOrderId = purchaseId.slice(0, 8).toUpperCase();

  const html = getPurchaseReceiptHTML(userName, bookTitle, amount, purchaseId, bookId, coverUrl, frontendUrl);

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: userEmail,
    subject: `Your receipt for "${bookTitle}" — Pagelist`,
    html,
    text: `Hi ${userName},\n\nThank you for your purchase!\n\n"${bookTitle}" — ${`$${amount.toFixed(2)}`}\n\nOrder #${shortOrderId}\n\nStart reading: ${frontendUrl}/reader/book/${bookId}\n\n— Pagelist`,
  });
}
