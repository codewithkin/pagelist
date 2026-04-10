import type { Context } from "hono";

/**
 * Success response with optional message
 * Format: { success: true, data: T, message?: string }
 */
export function ok<T>(
  c: Context,
  data: T,
  message?: string,
  status: 200 | 201 = 200,
) {
  return c.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    status,
  );
}

/**
 * Created response (201) with optional message
 */
export function created<T>(c: Context, data: T, message?: string) {
  return ok(c, data, message, 201);
}

/**
 * Error response with readable message
 * Format: { success: false, error: string }
 */
export function err(
  c: Context,
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 400,
) {
  return c.json(
    {
      success: false,
      error: message,
    },
    status,
  );
}
