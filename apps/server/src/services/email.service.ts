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
