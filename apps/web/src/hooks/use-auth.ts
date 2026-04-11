"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutation } from "@/lib/api-client";
import type { SessionData } from "@pagelist/auth/types";

// ---------------------------------------------------------------------------
// Session query (READ)
// ---------------------------------------------------------------------------

export const SESSION_QUERY_KEY = ["session"] as const;

export function useSession() {
  const { data, isPending } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () =>
      apiGet<{ session: SessionData } | null>("/api/auth/session").catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const session = data && "session" in data ? data.session : null;

  return {
    session,
    isPending,
    isAuthenticated: !!session,
  };
}

// ---------------------------------------------------------------------------
// Sign-in mutation (CUD)
// ---------------------------------------------------------------------------

interface SignInBody {
  email: string;
  password: string;
}

interface AuthResponse {
  session: SessionData;
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInBody) =>
      apiMutation<AuthResponse, SignInBody>("post", "/api/auth/sign-in", data),
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
    },
  });
}

// ---------------------------------------------------------------------------
// Sign-up mutation (CUD)
// ---------------------------------------------------------------------------

interface SignUpBody {
  name: string;
  email: string;
  password: string;
  role: "READER" | "WRITER";
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpBody) =>
      apiMutation<AuthResponse, SignUpBody>("post", "/api/auth/sign-up", data),
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, data);
    },
  });
}

// ---------------------------------------------------------------------------
// Sign-out mutation (CUD)
// ---------------------------------------------------------------------------

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiMutation("post", "/api/auth/sign-out"),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// Forgot password mutation
// ---------------------------------------------------------------------------

interface ForgotPasswordBody {
  email: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordBody) =>
      apiMutation<null, ForgotPasswordBody>("post", "/api/auth/forgot-password", data),
  });
}

// ---------------------------------------------------------------------------
// Reset password mutation
// ---------------------------------------------------------------------------

interface ResetPasswordBody {
  token: string;
  password: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordBody) =>
      apiMutation<null, ResetPasswordBody>("post", "/api/auth/reset-password", data),
  });
}
