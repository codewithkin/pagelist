import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleGetPublishedBooks,
  handleGetPublishedBook,
  handlePurchaseBook,
  handleGetReaderOrders,
  handleGetReaderLibrary,
} from "@/controllers/browse.controller";

const router = new Hono();

// Public endpoints
router.get("/", handleGetPublishedBooks);
router.get("/:id", handleGetPublishedBook);

// Reader endpoints
router.post("/:id/purchase", requireAuth, handlePurchaseBook);
router.get("/reader/orders", requireAuth, handleGetReaderOrders);
router.get("/reader/library", requireAuth, handleGetReaderLibrary);

export default router;
