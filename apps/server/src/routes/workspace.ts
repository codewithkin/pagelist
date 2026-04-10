import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { handleGetWorkspaceStats } from "@/controllers/workspace.controller";

const router = new Hono();

router.get("/stats", requireAuth, handleGetWorkspaceStats);

export default router;
