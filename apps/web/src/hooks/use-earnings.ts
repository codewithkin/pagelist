import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { AuthorSummary, EarningsSummary } from "@/types";

export const EARNINGS_QUERY_KEY = ["earnings"] as const;
export const AUTHOR_SUMMARY_QUERY_KEY = ["earnings", "summary"] as const;

export function useEarnings() {
  return useQuery({
    queryKey: EARNINGS_QUERY_KEY,
    queryFn: () => apiGet<EarningsSummary>("/api/earnings"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAuthorSummary() {
  return useQuery({
    queryKey: AUTHOR_SUMMARY_QUERY_KEY,
    queryFn: () => apiGet<AuthorSummary>("/api/earnings/summary"),
    staleTime: 2 * 60 * 1000,
  });
}
