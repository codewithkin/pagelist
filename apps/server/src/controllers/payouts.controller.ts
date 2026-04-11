import type { Context } from "hono";
import * as PayoutsService from "@/services/payouts.service";
import { ok, err } from "@/lib/response";

function getUserId(c: Context): string | null {
  const user = c.get("user") as { id: string } | undefined;
  return user?.id ?? null;
}

export async function handleGetPayouts(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const data = await PayoutsService.getPayoutSummary(userId);
    return ok(c, data);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load payouts.", 500);
  }
}

export async function handleSavePayoutMethod(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const body = await c.req.json();
    const { type, phoneNumber, bankName, accountName, accountNumber } = body;
    if (!type || !["ECOCASH", "BANK_TRANSFER"].includes(type)) {
      return err(c, "Invalid payout method type.");
    }
    if (type === "ECOCASH" && !phoneNumber?.trim()) {
      return err(c, "Phone number is required for EcoCash.");
    }
    if (type === "BANK_TRANSFER" && (!bankName?.trim() || !accountName?.trim() || !accountNumber?.trim())) {
      return err(c, "Bank name, account name, and account number are required for bank transfer.");
    }
    await PayoutsService.savePayoutMethod(userId, {
      type,
      phoneNumber: phoneNumber ?? null,
      bankName: bankName ?? null,
      accountName: accountName ?? null,
      accountNumber: accountNumber ?? null,
    });
    return ok(c, null, "Payout method saved.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to save payout method.", 500);
  }
}

export async function handleRequestPayout(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const body = await c.req.json();
    const { amountCents } = body;
    if (typeof amountCents !== "number" || amountCents <= 0) {
      return err(c, "Invalid payout amount.");
    }
    const payout = await PayoutsService.requestPayout(userId, amountCents);
    return ok(c, payout, "Payout requested.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to request payout.", 500);
  }
}
