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
    return err(c, "You must be signed in to complete onboarding.", 401);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return err(c, parsed.error.issues[0]?.message ?? "Please select at least one genre and try again.", 422);
  }

  try {
    await OnboardingService.completeOnboarding(
      userId,
      user.role,
      parsed.data.genres,
    );
    return ok(c, { completed: true }, "Great! Your preferences have been saved.");
  } catch (e) {
    let message = "We couldn't save your preferences. Please try again.";
    if (e instanceof Error) {
      message = e.message;
    }
    return err(c, message, 400);
  }
}

export async function handleGetOnboardingStatus(c: Context) {
  const userId = c.get("userId") as string;

  if (!userId) {
    return err(c, "You must be signed in to view onboarding status.", 401);
  }

  try {
    const status = await OnboardingService.getOnboardingStatus(userId);
    return ok(c, status);
  } catch (e) {
    let message = "We couldn't retrieve your onboarding status. Please try again.";
    if (e instanceof Error) {
      message = e.message;
    }
    return err(c, message, 400);
  }
}
