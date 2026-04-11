import type { Context } from "hono";
import * as EarningsService from "@/services/earnings.service";
import { ok, err } from "@/lib/response";

function getUserId(c: Context): string | null {
  const user = c.get("user") as { id: string } | undefined;
  return user?.id ?? null;
}

export async function handleGetEarnings(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const data = await EarningsService.getEarningsSummary(userId);
    return ok(c, data);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load earnings.", 500);
  }
}

export async function handleGetAuthorSummary(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const data = await EarningsService.getAuthorSummary(userId);
    return ok(c, data);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load summary.", 500);
  }
}
