import type { Context } from "hono";
import * as BrowseService from "@/services/browse.service";
import * as ReviewService from "@/services/review.service";
import { ok, created, err } from "@/lib/response";

function getUserId(c: Context): string | null {
  const user = c.get("user") as { id: string } | undefined;
  return user?.id ?? null;
}

export async function handleGetPublishedBooks(c: Context) {
  try {
    const books = await BrowseService.getPublishedBooks();
    return ok(c, books);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load books.", 500);
  }
}

export async function handleGetPublishedBook(c: Context) {
  const bookId = c.req.param("id");
  const userId = getUserId(c);
  console.log(`[Browse] Fetching book: ${bookId}, UserId: ${userId || "anonymous"}`);
  try {
    const book = await BrowseService.getBookForReading(bookId, userId);
    if (!book) {
      console.log(`[Browse] Book not found: ${bookId}`);
      return err(c, "Book not found.", 404);
    }
    console.log(`[Browse] Book found: ${bookId}`);
    return ok(c, book);
  } catch (e) {
    console.error(`[Browse] Error fetching book ${bookId}:`, e);
    return err(c, e instanceof Error ? e.message : "Failed to load book.", 500);
  }
}

export async function handlePurchaseBook(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const order = await BrowseService.purchaseBook(userId, bookId);
    return created(c, order, "Purchase successful.");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to complete purchase.";
    // Check if error is about payment being required
    if (message.includes("requires payment")) {
      return err(c, message, 422);
    }
    return err(c, message, 500);
  }
}

export async function handleGetReaderOrders(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const orders = await BrowseService.getReaderOrders(userId);
    return ok(c, orders);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load orders.", 500);
  }
}

export async function handleGetReaderLibrary(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const books = await BrowseService.getReaderLibrary(userId);
    return ok(c, books);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load library.", 500);
  }
}

export async function handleGetBookReviews(c: Context) {
  const bookId = c.req.param("id");
  try {
    const [reviews, stats] = await Promise.all([
      ReviewService.getBookReviews(bookId),
      ReviewService.getReviewStats(bookId),
    ]);
    return ok(c, { reviews, stats });
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load reviews.", 500);
  }
}

export async function handleGetMyReview(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const review = await ReviewService.getMyReview(bookId, userId);
    return ok(c, review);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load review.", 500);
  }
}

export async function handleAddReview(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const body = await c.req.json();
    const { rating, comment } = body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return err(c, "Rating must be a number between 1 and 5.");
    }
    const review = await ReviewService.addReview(userId, bookId, rating, comment);
    return created(c, review, "Review submitted.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to submit review.", 500);
  }
}

export async function handleUpdateReview(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const body = await c.req.json();
    const { rating, comment } = body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return err(c, "Rating must be a number between 1 and 5.");
    }
    const review = await ReviewService.updateReview(userId, bookId, rating, comment);
    return ok(c, review, "Review updated.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to update review.", 500);
  }
}

export async function handleDeleteReview(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    await ReviewService.deleteReview(userId, bookId);
    return ok(c, null, "Review deleted.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to delete review.", 500);
  }
}
