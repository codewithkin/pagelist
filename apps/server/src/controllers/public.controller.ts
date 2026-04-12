import type { Context } from "hono";
import * as PublicService from "@/services/public.service";
import { ok, err } from "@/lib/response";

export async function handleGetAuthorProfile(c: Context) {
  const authorId = c.req.param("id");
  try {
    const profile = await PublicService.getAuthorProfile(authorId);
    if (!profile) return err(c, "Author not found.", 404);
    return ok(c, profile);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load author.", 500);
  }
}

export async function handleGetAuthorBooks(c: Context) {
  const authorId = c.req.param("id");
  try {
    const books = await PublicService.getAuthorBooks(authorId);
    return ok(c, books);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load books.", 500);
  }
}

export async function handleGetBookSummary(c: Context) {
  const bookId = c.req.param("id");
  try {
    const summary = await PublicService.getBookSummary(bookId);
    if (!summary) return err(c, "Book not found.", 404);
    return ok(c, summary);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load book.", 500);
  }
}

export async function handleGetBookDetail(c: Context) {
  const bookId = c.req.param("id");
  try {
    const book = await PublicService.getPublicBookDetail(bookId);
    if (!book) return err(c, "Book not found.", 404);
    return ok(c, book);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load book.", 500);
  }
}

export async function handleGetGenres(c: Context) {
  try {
    const genres = await PublicService.getGenres();
    return ok(c, genres);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load genres.", 500);
  }
}

export async function handleGetCatalogue(c: Context) {
  try {
    const { genre, sort, price, q, offset, limit } = c.req.query();
    const result = await PublicService.getCatalogue({
      genre: genre || undefined,
      sort: sort || undefined,
      price: price || undefined,
      q: q || undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return ok(c, result);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load catalogue.", 500);
  }
}
