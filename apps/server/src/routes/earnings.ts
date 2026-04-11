import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { handleGetEarnings, handleGetAuthorSummary } from "@/controllers/earnings.controller";

const router = new Hono();

router.get("/", requireAuth, handleGetEarnings);
router.get("/summary", requireAuth, handleGetAuthorSummary);

export default router;
