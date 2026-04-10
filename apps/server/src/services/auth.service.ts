import prisma from "@pagelist/db";
import { hashPassword, verifyPassword, signToken } from "@pagelist/auth/server";
import { env } from "@pagelist/env/server";
import type { SignInInput, SignUpInput, SessionData } from "@pagelist/auth/types";

const SESSION_TTL_DAYS = 7;

function sessionExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_TTL_DAYS);
  return d;
}

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
