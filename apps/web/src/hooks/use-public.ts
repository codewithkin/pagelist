import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { Book, BookDetail, BookSummary, Author, CatalogueResult, Review, ReviewStats } from "@/types";

/* ── Featured books (home page — latest 6) ─────────────────────── */

export function useFeaturedBooks() {
  return useQuery({
    queryKey: ["public", "featured"],
    queryFn: () =>
      apiGet<CatalogueResult>("/api/public/catalogue?sort=recent&limit=6"),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/* ── Genre-filtered books (home page — 6 per genre) ────────────── */

export function useGenreBooks(genre: string | null) {
  return useQuery({
    queryKey: ["public", "genre-books", genre],
    queryFn: () =>
      apiGet<CatalogueResult>(`/api/public/catalogue?genre=${encodeURIComponent(genre!)}&limit=6`),
    staleTime: 5 * 60 * 1000,
    enabled: !!genre,
    retry: false,
  });
}

/* ── Full catalogue (browse page) ──────────────────────────────── */

export function useCatalogue(params: {
  genre?: string;
  sort?: string;
  price?: string;
  q?: string;
  offset?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.genre) qs.set("genre", params.genre);
  if (params.sort) qs.set("sort", params.sort);
  if (params.price) qs.set("price", params.price);
  if (params.q) qs.set("q", params.q);
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.limit) qs.set("limit", String(params.limit));

  const key = qs.toString();

  return useQuery({
    queryKey: ["public", "catalogue", key],
    queryFn: () => apiGet<CatalogueResult>(`/api/public/catalogue?${key}`),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

/* ── Genres ─────────────────────────────────────────────────────── */

export function useGenres() {
  return useQuery({
    queryKey: ["public", "genres"],
    queryFn: () => apiGet<string[]>("/api/public/genres"),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

/* ── Book detail ───────────────────────────────────────────────── */

export function usePublicBookDetail(bookId: string) {
  return useQuery({
    queryKey: ["public", "book", bookId],
    queryFn: () => apiGet<BookDetail>(`/api/public/books/${bookId}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!bookId,
  });
}

/* ── Book summary (lightweight, for intent callout) ────────────── */

export function useBookSummary(bookId: string | null) {
  return useQuery({
    queryKey: ["public", "book-summary", bookId],
    queryFn: () => apiGet<BookSummary>(`/api/public/books/${bookId!}/summary`),
    staleTime: 10 * 60 * 1000,
    enabled: !!bookId,
  });
}

/* ── Book reviews (public) ─────────────────────────────────────── */

export function usePublicBookReviews(bookId: string) {
  return useQuery({
    queryKey: ["public", "book", bookId, "reviews"],
    queryFn: () => apiGet<{ reviews: Review[]; stats: ReviewStats }>(`/api/browse/${bookId}/reviews`),
    staleTime: 2 * 60 * 1000,
    enabled: !!bookId,
  });
}

/* ── Author profile ────────────────────────────────────────────── */

export function useAuthorProfile(authorId: string) {
  return useQuery({
    queryKey: ["public", "author", authorId],
    queryFn: () => apiGet<Author>(`/api/public/authors/${authorId}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!authorId,
  });
}

/* ── Author's books ────────────────────────────────────────────── */

export function useAuthorBooks(authorId: string) {
  return useQuery({
    queryKey: ["public", "author", authorId, "books"],
    queryFn: () => apiGet<Book[]>(`/api/public/authors/${authorId}/books`),
    staleTime: 5 * 60 * 1000,
    enabled: !!authorId,
  });
}
