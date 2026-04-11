import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";
import type { Book } from "@/types";

export const BOOKS_QUERY_KEY = ["books"] as const;

export function useAuthorBooks() {
  return useQuery({
    queryKey: BOOKS_QUERY_KEY,
    queryFn: () => apiGet<Book[]>("/api/books"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAuthorBook(bookId: string) {
  return useQuery({
    queryKey: [...BOOKS_QUERY_KEY, bookId],
    queryFn: () => apiGet<Book>(`/api/books/${bookId}`),
    enabled: !!bookId,
  });
}

export interface CreateBookPayload {
  title: string;
  description: string;
  genre: string;
  language: string;
  priceCents: number;
  coverUrl?: string | null;
  fileUrl?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookPayload) =>
      apiMutation<Book>("post", "/api/books", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}

export function useUpdateBook(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateBookPayload>) =>
      apiMutation<Book>("put", `/api/books/${bookId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) =>
      apiMutation("delete", `/api/books/${bookId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY });
    },
  });
}
