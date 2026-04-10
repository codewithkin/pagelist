import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";

export interface OnboardingStatus {
  completed: boolean;
  role: "READER" | "WRITER";
  selectedGenres: string[];
}

export const ONBOARDING_QUERY_KEY = ["onboarding", "status"] as const;

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEY,
    queryFn: () =>
      apiGet<{ data: OnboardingStatus }>("/api/onboarding/status").then(
        (r) => r.data,
      ),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: (genres: string[]) =>
      apiMutation<{ completed: boolean }, { genres: string[] }>(
        "post",
        "/api/onboarding/complete",
        { genres },
      ),
  });
}
