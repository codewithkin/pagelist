import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";
import type { Payout, PayoutMethod } from "@/types";

export interface PayoutSummary {
  availableBalance: number;
  totalWithdrawn: number;
  totalPending: number;
  payouts: Payout[];
  payoutMethod: PayoutMethod | null;
}

export const PAYOUTS_QUERY_KEY = ["payouts"] as const;

export function usePayouts() {
  return useQuery({
    queryKey: PAYOUTS_QUERY_KEY,
    queryFn: () => apiGet<PayoutSummary>("/api/payouts"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSavePayoutMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayoutMethod) =>
      apiMutation("put", "/api/payouts/method", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
    },
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountCents: number) =>
      apiMutation<Payout>("post", "/api/payouts/request", { amountCents }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
    },
  });
}
