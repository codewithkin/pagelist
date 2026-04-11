import prisma from "@pagelist/db";
import { hashPassword, verifyPassword, signToken } from "@pagelist/auth/server";
import { env } from "@pagelist/env/server";
import type { SignInInput, SignUpInput, SessionData } from "@pagelist/auth/types";
import { sendVerificationEmail } from "./email.service";

const SESSION_TTL_DAYS = 7;
const EMAIL_VERIFICATION_TTL_MINUTES = 5;

function sessionExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_TTL_DAYS);
  return d;
}

function emailVerificationTokenExpiresAt(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + EMAIL_VERIFICATION_TTL_MINUTES);
  return d;
}

/**
 * Initiate sign up: create user and send verification email.
 * Does NOT create a session.
 */
export async function initiateSignUp(
  input: SignUpInput,
  verificationBaseUrl: string,
): Promise<{ email: string; message: string }> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const verificationToken = crypto.randomUUID();
  const verificationTokenExpiresAt = emailVerificationTokenExpiresAt();

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
    },
  });

  try {
    await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
      verificationBaseUrl,
    );
  } catch (e) {
    // Log but don't throw — allow signup to complete even if email fails
    console.error("Failed to send verification email:", e);
  }

  return {
    email: user.email,
    message: "Verification email sent. Please check your inbox.",
  };
}

/**
 * Verify email using token and create session.
 */
export async function verifyEmail(
  token: string,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<SessionData> {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new Error("Invalid verification token.");
  }

  // Check if token expired
  if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
    throw new Error("Verification token has expired. Please sign up again.");
  }

  // Mark email as verified and clear token
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    },
  });

  return createSession(updatedUser, meta);
}

/**
 * Original sign up flow (kept for backward compat but now with email check).
 */
export async function signUp(
  input: SignUpInput,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<SessionData> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      emailVerified: new Date(), // For backward compat, mark as verified immediately
    },
  });

  return createSession(user, meta);
}

export async function signIn(
  input: SignInInput,
  meta: { ipAddress?: string; userAgent?: string },
): Promise<SessionData> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
  }

  return createSession(user, meta);
}

export async function signOut(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const token = await signToken(
    { sub: session.user.id, sid: session.id },
    env.JWT_SECRET,
  );

  return toSessionData(session.user, token, session.expiresAt);
}

async function createSession(
  user: { id: string; name: string; email: string; role: "READER" | "WRITER"; createdAt: Date },
  meta: { ipAddress?: string; userAgent?: string },
): Promise<SessionData> {
  const expiresAt = sessionExpiresAt();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });

  const token = await signToken(
    { sub: user.id, sid: session.id },
    env.JWT_SECRET,
  );

  return toSessionData(user, token, expiresAt);
}

function toSessionData(
  user: { id: string; name: string; email: string; role: "READER" | "WRITER"; createdAt: Date },
  token: string,
  expiresAt: Date,
): SessionData {
  return {
    token,
    expiresAt: expiresAt.toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    },
  };
}
