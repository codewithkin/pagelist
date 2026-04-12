import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";

export interface InitiatePaymentResponse {
  intermediatePaymentId: string;
  redirectUrl: string;
}

export interface CompletePaymentResponse {
  purchaseId: string;
  bookId: string;
  bookTitle: string;
  amount: number;
}

export interface PaymentStatus {
  exists: boolean;
  paid: boolean;
  alreadyOwned: boolean;
  userMismatch: boolean;
  expired: boolean;
  bookTitle: string | null;
  amount: number | null;
}

const LIBRARY_BOOKS_QUERY_KEY = ["library", "books"] as const;
const ORDERS_QUERY_KEY = ["orders"] as const;
const BROWSE_QUERY_KEY = ["browse"] as const;

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (bookId: string) =>
      apiMutation<InitiatePaymentResponse, { bookId: string }>("post", "/api/payments/initiate", {
        bookId,
      }),
  });
}

export function useCompletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (intermediatePaymentId: string) =>
      apiMutation<CompletePaymentResponse>("post", `/api/payments/complete/${intermediatePaymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_BOOKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BROWSE_QUERY_KEY });
    },
  });
}

export function usePaymentStatus(intermediatePaymentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["payments", "status", intermediatePaymentId],
    queryFn: () => apiGet<PaymentStatus>(`/api/payments/status/${intermediatePaymentId}`),
    enabled: enabled && !!intermediatePaymentId,
    staleTime: 30 * 1000,
    retry: false,
  });
}
