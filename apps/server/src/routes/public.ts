import { Hono } from "hono";
import {
  handleGetAuthorProfile,
  handleGetAuthorBooks,
  handleGetBookSummary,
  handleGetBookDetail,
  handleGetGenres,
  handleGetCatalogue,
} from "@/controllers/public.controller";

const router = new Hono();

// Genres
router.get("/genres", handleGetGenres);

// Catalogue (paginated + filterable)
router.get("/catalogue", handleGetCatalogue);

// Book summary (lightweight, for purchase intent callout)
router.get("/books/:id/summary", handleGetBookSummary);

// Book detail (full info including authorId)
router.get("/books/:id", handleGetBookDetail);

// Author profile
router.get("/authors/:id", handleGetAuthorProfile);

// Author's published books
router.get("/authors/:id/books", handleGetAuthorBooks);

export default router;
