import { useMutation } from "@tanstack/react-query";
import { apiMutation, ApiError } from "@/lib/api-client";

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
    onError: (error) => {
      // Error message is automatically extracted in apiMutation
      // Display it in the UI through the error state
    },
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
    onError: (error) => {
      // Error message is automatically extracted in apiMutation
      // Display it in the UI through the error state
    },
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (email: string) =>
      apiMutation<{ message: string }, { email: string }>(
        "post",
        "/api/auth/resend-verification-email",
        { email },
      ),
    onError: (error) => {
      // Error message is automatically extracted in apiMutation
      // Display it in the UI through the error state
    },
  });
}
