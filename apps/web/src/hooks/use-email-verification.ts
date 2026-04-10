import { useMutation } from "@tanstack/react-query";
import { apiMutation } from "@/lib/api-client";

export interface SignUpResponse {
  pendingVerification: boolean;
  email: string;
  message: string;
}

export interface VerifyEmailResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "READER" | "WRITER";
    createdAt: string;
  };
  token: string;
  expiresAt: string;
}

export function useSignUpWithVerification() {
  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      password: string;
      role: "READER" | "WRITER";
    }) =>
      apiMutation<SignUpResponse, typeof input>(
        "post",
        "/api/auth/sign-up",
        input,
      ),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiMutation<VerifyEmailResponse, { token: string }>(
        "post",
        "/api/auth/verify-email",
        { token },
      ),
  });
}
