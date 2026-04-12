import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";
import type { Book, Order, Review, ReviewStats } from "@/types";

export const BROWSE_QUERY_KEY = ["browse"] as const;
export const LIBRARY_BOOKS_QUERY_KEY = ["library", "books"] as const;
export const ORDERS_QUERY_KEY = ["orders"] as const;

export function useBrowseBooks() {
  return useQuery({
    queryKey: BROWSE_QUERY_KEY,
    queryFn: () => apiGet<Book[]>("/api/browse"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: ["browse", "book", bookId],
    queryFn: () => apiGet<Book>(`/api/browse/${bookId}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!bookId,
  });
}

export function useBookReviews(bookId: string) {
  return useQuery({
    queryKey: ["browse", "book", bookId, "reviews"],
    queryFn: () => apiGet<{ reviews: Review[]; stats: ReviewStats }>(`/api/browse/${bookId}/reviews`),
    staleTime: 2 * 60 * 1000,
    enabled: !!bookId,
  });
}

export function useMyReview(bookId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["browse", "book", bookId, "reviews", "mine"],
    queryFn: () => apiGet<Review | null>(`/api/browse/${bookId}/reviews/mine`).catch(() => null),
    staleTime: 2 * 60 * 1000,
    enabled: !!bookId && enabled,
  });
}

export function useAddReview(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      apiMutation<Review>("post", `/api/browse/${bookId}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId] });
    },
  });
}

export function useUpdateReview(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      apiMutation<Review>("put", `/api/browse/${bookId}/reviews/mine`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId] });
    },
  });
}

export function useDeleteReview(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiMutation<null>("delete", `/api/browse/${bookId}/reviews/mine`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId, "reviews", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["browse", "book", bookId] });
    },
  });
}

export function useLibraryBooks() {
  return useQuery({
    queryKey: LIBRARY_BOOKS_QUERY_KEY,
    queryFn: () => apiGet<Book[]>("/api/browse/reader/library"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => apiGet<Order[]>("/api/browse/reader/orders"),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePurchaseBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) =>
      apiMutation<Order>("post", `/api/browse/${bookId}/purchase`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_BOOKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BROWSE_QUERY_KEY });
    },
  });
}
