import type { Context, Next } from "hono";
import { verifyToken } from "@pagelist/auth/server";
import { env } from "@pagelist/env/server";
import prisma from "@pagelist/db";

export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookieToken(c.req.raw);

  const raw = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (raw) {
    try {
      const payload = await verifyToken(raw, env.JWT_SECRET);
      if (payload) {
        const session = await prisma.session.findUnique({
          where: { id: payload.sid },
          include: { user: true },
        });

        if (session && session.expiresAt >= new Date()) {
          c.set("user", session.user);
          c.set("sessionId", session.id);
        }
      }
    } catch {
      // Silently fail - user remains unauthenticated
    }
  }

  await next();
}

function getCookieToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] ?? null;
}
