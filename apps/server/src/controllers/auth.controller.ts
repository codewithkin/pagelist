import type { Context } from "hono";
import { z } from "zod";
import * as AuthService from "@/services/auth.service";
import { ok, created, err } from "@/lib/response";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["READER", "WRITER"]),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

function meta(c: Context) {
  return {
    ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip"),
    userAgent: c.req.header("user-agent"),
  };
}

export async function handleSignUp(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const session = await AuthService.signUp(parsed.data, meta(c));
    setTokenCookie(c, session.token, new Date(session.expiresAt));
    return created(c, session);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed.";
    return err(c, message, 409);
  }
}

export async function handleSignIn(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    const session = await AuthService.signIn(parsed.data, meta(c));
    setTokenCookie(c, session.token, new Date(session.expiresAt));
    return ok(c, session);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign in failed.";
    return err(c, message, 401);
  }
}

export async function handleSignOut(c: Context) {
  const sessionId = c.get("sessionId") as string;
  await AuthService.signOut(sessionId);
  clearTokenCookie(c);
  return ok(c, null);
}

export async function handleGetSession(c: Context) {
  const sessionId = c.get("sessionId") as string;
  const session = await AuthService.getSession(sessionId);
  if (!session) return err(c, "Session not found.", 401);
  return ok(c, session);
}

function setTokenCookie(c: Context, token: string, expires: Date) {
  c.header(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
  );
}

function clearTokenCookie(c: Context) {
  c.header(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
}
