import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { handleGetLibraryStats } from "@/controllers/library.controller";

const router = new Hono();

router.get("/stats", requireAuth, handleGetLibraryStats);

export default router;
