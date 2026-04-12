import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleCompletePayment,
  handleGetPaymentStatus,
  handleInitiatePayment,
} from "@/controllers/payments.controller";

const router = new Hono();

router.post("/initiate", requireAuth, handleInitiatePayment);
router.post("/complete/:id", requireAuth, handleCompletePayment);
router.get("/status/:id", requireAuth, handleGetPaymentStatus);

export default router;
