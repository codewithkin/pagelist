import type { Context } from "hono";
import * as BrowseService from "@/services/browse.service";
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
  try {
    const book = await BrowseService.getPublishedBook(bookId);
    if (!book) return err(c, "Book not found.", 404);
    return ok(c, book);
  } catch (e) {
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
    return err(c, e instanceof Error ? e.message : "Failed to complete purchase.", 500);
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
