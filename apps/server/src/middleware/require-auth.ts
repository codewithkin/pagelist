import type { Context, Next } from "hono";
import { verifyToken } from "@pagelist/auth/server";
import { env } from "@pagelist/env/server";
import prisma from "@pagelist/db";
import { err } from "@/lib/response";

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  const cookieToken = getCookieToken(c.req.raw);

  const raw = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!raw) {
    return err(c, "Unauthorized", 401);
  }

  const payload = await verifyToken(raw, env.JWT_SECRET);
  if (!payload) {
    return err(c, "Unauthorized", 401);
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return err(c, "Session expired", 401);
  }

  c.set("user", session.user);
  c.set("sessionId", session.id);

  await next();
}

function getCookieToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] ?? null;
}
