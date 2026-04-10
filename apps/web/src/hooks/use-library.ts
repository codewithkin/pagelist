import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export interface LibraryStats {
  stats: {
    totalOwned: number;
    currentlyReading: number;
    completed: number;
    wishlist: number;
  };
  currentReads: {
    id: string;
    title: string;
    author: string;
    progress: number;
    coverColor: string;
  }[];
  recentlyAdded: {
    id: string;
    title: string;
    author: string;
    addedAt: string;
  }[];
  monthlyActivity: {
    month: string;
    books: number;
  }[];
}

export const LIBRARY_QUERY_KEY = ["library", "stats"] as const;

export function useLibraryStats() {
  return useQuery({
    queryKey: LIBRARY_QUERY_KEY,
    queryFn: () =>
      apiGet<{ data: LibraryStats }>("/api/library/stats").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
