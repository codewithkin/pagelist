import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { optionalAuth } from "@/middleware/optional-auth";
import {
  handleGetPublishedBooks,
  handleGetPublishedBook,
  handlePurchaseBook,
  handleGetReaderOrders,
  handleGetReaderLibrary,
  handleGetBookReviews,
  handleGetMyReview,
  handleAddReview,
  handleUpdateReview,
  handleDeleteReview,
} from "@/controllers/browse.controller";

const router = new Hono();

// Public endpoints with optional authentication
router.get("/", optionalAuth, handleGetPublishedBooks);

// Reader endpoints (must be before /:id to avoid conflict)
router.get("/reader/orders", requireAuth, handleGetReaderOrders);
router.get("/reader/library", requireAuth, handleGetReaderLibrary);

// Individual book - with optional auth to allow reading owned/purchased books
router.get("/:id", optionalAuth, handleGetPublishedBook);
router.post("/:id/purchase", requireAuth, handlePurchaseBook);

// Reviews
router.get("/:id/reviews", handleGetBookReviews);
router.get("/:id/reviews/mine", requireAuth, handleGetMyReview);
router.post("/:id/reviews", requireAuth, handleAddReview);
router.put("/:id/reviews/mine", requireAuth, handleUpdateReview);
router.delete("/:id/reviews/mine", requireAuth, handleDeleteReview);

export default router;
