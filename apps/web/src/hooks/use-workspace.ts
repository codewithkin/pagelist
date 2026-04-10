import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export interface WorkspaceStats {
  stats: {
    publishedBooks: number;
    totalReaders: number;
    monthlyRevenueCents: number;
    avgRating: number;
  };
  recentBooks: {
    id: string;
    title: string;
    status: "published" | "draft";
    readers: number;
    revenueCents: number;
    publishedAt: string;
  }[];
  viewsData: {
    month: string;
    views: number;
  }[];
}

export const WORKSPACE_QUERY_KEY = ["workspace", "stats"] as const;

export function useWorkspaceStats() {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEY,
    queryFn: () =>
      apiGet<{ data: WorkspaceStats }>("/api/workspace/stats").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
