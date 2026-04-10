import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleSignUp,
  handleSignIn,
  handleSignOut,
  handleGetSession,
} from "@/controllers/auth.controller";

const router = new Hono();

router.post("/sign-up", handleSignUp);
router.post("/sign-in", handleSignIn);
router.post("/sign-out", requireAuth, handleSignOut);
router.get("/session", requireAuth, handleGetSession);

export default router;
