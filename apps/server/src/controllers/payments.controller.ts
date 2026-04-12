import type { Context } from "hono";
import { ok, created, err } from "@/lib/response";
import { PaymentError, completePayment, getPaymentStatus, initiatePayment } from "@/services/payments.service";

function getUserId(c: Context): string | null {
  const user = c.get("user") as { id: string } | undefined;
  return user?.id ?? null;
}

export async function handleInitiatePayment(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);

  const body = await c.req.json().catch(() => null);
  const bookId = body?.bookId;
  if (typeof bookId !== "string" || !bookId) {
    return err(c, "bookId is required.", 422);
  }

  try {
    const result = await initiatePayment(userId, bookId);
    return created(c, result, "Payment initiated.");
  } catch (e) {
    if (e instanceof PaymentError) return err(c, e.message, e.status);
    return err(c, e instanceof Error ? e.message : "Failed to initiate payment.", 500);
  }
}

export async function handleCompletePayment(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);

  const intermediatePaymentId = c.req.param("id");
  if (!intermediatePaymentId) {
    return err(c, "intermediatePayment id is required.", 422);
  }

  try {
    const result = await completePayment(intermediatePaymentId, userId);
    return ok(c, result, "Payment completed.");
  } catch (e) {
    if (e instanceof PaymentError) return err(c, e.message, e.status);
    return err(c, e instanceof Error ? e.message : "Failed to complete payment.", 500);
  }
}

export async function handleGetPaymentStatus(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);

  const intermediatePaymentId = c.req.param("id");
  if (!intermediatePaymentId) {
    return err(c, "intermediatePayment id is required.", 422);
  }

  try {
    const status = await getPaymentStatus(intermediatePaymentId, userId);
    return ok(c, status);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load payment status.", 500);
  }
}
