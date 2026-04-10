import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleCompleteOnboarding,
  handleGetOnboardingStatus,
} from "@/controllers/onboarding.controller";

const router = new Hono();

router.post("/complete", requireAuth, handleCompleteOnboarding);
router.get("/status", requireAuth, handleGetOnboardingStatus);

export default router;
