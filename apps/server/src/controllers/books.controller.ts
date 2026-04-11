import type { Context } from "hono";
import * as BooksService from "@/services/books.service";
import { ok, created, err } from "@/lib/response";

function getUserId(c: Context): string | null {
  const user = c.get("user") as { id: string } | undefined;
  return user?.id ?? null;
}

export async function handleGetBooks(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const books = await BooksService.getAuthorBooks(userId);
    return ok(c, books);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load books.", 500);
  }
}

export async function handleGetBook(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const book = await BooksService.getAuthorBook(bookId, userId);
    if (!book) return err(c, "Book not found.", 404);
    return ok(c, book);
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to load book.", 500);
  }
}

export async function handleCreateBook(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  try {
    const body = await c.req.json();
    const { title, description, genre, language, priceCents, coverUrl, fileUrl, status } = body;
    if (!title?.trim()) return err(c, "Title is required.");
    if (!genre?.trim()) return err(c, "Genre is required.");
    if (!language?.trim()) return err(c, "Language is required.");
    if (typeof priceCents !== "number" || priceCents < 0) return err(c, "Invalid price.");

    const book = await BooksService.createBook(userId, {
      title: title.trim(),
      description: description?.trim() ?? "",
      genre: genre.trim(),
      language: language.trim(),
      priceCents,
      coverUrl: coverUrl ?? null,
      fileUrl: fileUrl ?? null,
      status: status ?? "DRAFT",
    });
    return created(c, book, "Book created.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to create book.", 500);
  }
}

export async function handleUpdateBook(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    const body = await c.req.json();
    const { title, description, genre, language, priceCents, coverUrl, fileUrl, status } = body;

    const patch: BooksService.UpdateBookInput = {};
    if (title !== undefined) patch.title = title.trim();
    if (description !== undefined) patch.description = description.trim();
    if (genre !== undefined) patch.genre = genre.trim();
    if (language !== undefined) patch.language = language.trim();
    if (priceCents !== undefined) patch.priceCents = priceCents;
    if (coverUrl !== undefined) patch.coverUrl = coverUrl;
    if (fileUrl !== undefined) patch.fileUrl = fileUrl;
    if (status !== undefined) patch.status = status;

    const book = await BooksService.updateBook(bookId, userId, patch);
    return ok(c, book, "Book updated.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to update book.", 500);
  }
}

export async function handleDeleteBook(c: Context) {
  const userId = getUserId(c);
  if (!userId) return err(c, "Unauthorized", 401);
  const bookId = c.req.param("id");
  try {
    await BooksService.deleteBook(bookId, userId);
    return ok(c, null, "Book deleted.");
  } catch (e) {
    return err(c, e instanceof Error ? e.message : "Failed to delete book.", 500);
  }
}
