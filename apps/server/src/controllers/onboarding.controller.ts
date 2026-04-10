import type { Context } from "hono";
import { z } from "zod";
import * as OnboardingService from "@/services/onboarding.service";
import { ok, err } from "@/lib/response";

const onboardingSchema = z.object({
  genres: z.array(z.string()).min(1, "Please select at least one genre."),
});

export async function handleCompleteOnboarding(c: Context) {
  const userId = c.get("userId") as string;
  const user = c.get("user") as { role?: "READER" | "WRITER" };

  if (!userId || !user?.role) {
    return err(c, "User not found.", 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Invalid input.", 422);
  }

  try {
    await OnboardingService.completeOnboarding(
      userId,
      user.role,
      parsed.data.genres,
    );
    return ok(c, { completed: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Onboarding failed.";
    return err(c, message, 400);
  }
}

export async function handleGetOnboardingStatus(c: Context) {
  const userId = c.get("userId") as string;

  if (!userId) {
    return err(c, "User not found.", 401);
  }

  try {
    const status = await OnboardingService.getOnboardingStatus(userId);
    return ok(c, status);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get onboarding status.";
    return err(c, message, 400);
  }
}
