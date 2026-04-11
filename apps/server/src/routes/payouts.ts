import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleGetPayouts,
  handleSavePayoutMethod,
  handleRequestPayout,
} from "@/controllers/payouts.controller";

const router = new Hono();

router.get("/", requireAuth, handleGetPayouts);
router.put("/method", requireAuth, handleSavePayoutMethod);
router.post("/request", requireAuth, handleRequestPayout);

export default router;
