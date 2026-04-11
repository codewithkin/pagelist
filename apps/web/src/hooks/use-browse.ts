import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";
import type { Book, Order } from "@/types";

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
