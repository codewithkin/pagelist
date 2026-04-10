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

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required."),
});

function meta(c: Context) {
  return {
    ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("cf-connecting-ip"),
    userAgent: c.req.header("user-agent"),
  };
}

function getVerificationBaseUrl(c: Context): string {
  const host = c.req.header("host") || "localhost:3000";
  const protocol = c.req.header("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

/**
 * POST /api/auth/sign-up
 * Initiates signup: creates user, sends verification email, returns pending status.
 */
export async function handleSignUp(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Please check your input and try again.", 422);
  }

  try {
    const verificationBaseUrl = getVerificationBaseUrl(c);
    const result = await AuthService.initiateSignUp(parsed.data, verificationBaseUrl);
    return created(c, {
      pendingVerification: true,
      email: result.email,
      message: result.message,
    }, "Check your email to verify your account.");
  } catch (e) {
    let message = "We couldn't create your account. Please try again.";
    if (e instanceof Error) {
      if (e.message.includes("already exists")) {
        message = "This email is already registered. Try signing in instead.";
      } else {
        message = e.message;
      }
    }
    return err(c, message, 409);
  }
}

/**
 * POST /api/auth/verify-email
 * Verifies email token and creates session.
 */
export async function handleVerifyEmail(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, "Invalid verification link. Please check your email again.", 422);
  }

  try {
    const session = await AuthService.verifyEmail(parsed.data.token, meta(c));
    setTokenCookie(c, session.token, new Date(session.expiresAt));
    return ok(c, session, "Email verified! Proceeding to onboarding...");
  } catch (e) {
    let message = "We couldn't verify your email. Please try again.";
    if (e instanceof Error) {
      if (e.message.includes("expired")) {
        message = "Your verification link has expired (5 minute limit). Please sign up again.";
      } else if (e.message.includes("Invalid")) {
        message = "This verification link is invalid. Please check your email again.";
      } else {
        message = e.message;
      }
    }
    return err(c, message, 400);
  }
}

export async function handleSignIn(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Please check your input and try again.", 422);
  }

  try {
    const session = await AuthService.signIn(parsed.data, meta(c));
    setTokenCookie(c, session.token, new Date(session.expiresAt));
    return ok(c, session, "Welcome back!");
  } catch (e) {
    let message = "Invalid email or password. Please try again.";
    if (e instanceof Error) {
      if (e.message.includes("verify")) {
        message = "Please verify your email before signing in. Check your inbox for the verification link.";
      } else {
        message = e.message;
      }
    }
    return err(c, message, 401);
  }
}

export async function handleSignOut(c: Context) {
  const sessionId = c.get("sessionId") as string;
  await AuthService.signOut(sessionId);
  clearTokenCookie(c);
  return ok(c, null, "Signed out successfully.");
}

export async function handleGetSession(c: Context) {
  const sessionId = c.get("sessionId") as string;
  const session = await AuthService.getSession(sessionId);
  if (!session) return err(c, "Your session has expired. Please sign in again.", 401);
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
