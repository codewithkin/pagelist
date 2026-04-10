import type { SessionData, SignInInput, SignUpInput, AuthResult } from "./types";

export function createAuthClient(baseURL: string) {
  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<AuthResult<T>> {
    try {
      const res = await fetch(`${baseURL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string> | undefined),
        },
      });
      const json = (await res.json()) as T | { error?: string };
      if (!res.ok) {
        return {
          data: null,
          error: (json as { error?: string }).error ?? "Request failed",
        };
      }
      return { data: json as T, error: null };
    } catch {
      return { data: null, error: "Network error. Please check your connection." };
    }
  }

  function signIn(input: SignInInput): Promise<AuthResult<SessionData>> {
    return request<SessionData>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  function signUp(input: SignUpInput): Promise<AuthResult<SessionData>> {
    return request<SessionData>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async function signOut(): Promise<void> {
    await request("/api/auth/sign-out", { method: "POST" });
  }

  function getSession(): Promise<SessionData | null> {
    return request<SessionData>("/api/auth/session").then((r) => r.data);
  }

  return { signIn, signUp, signOut, getSession };
}

export type AuthClient = ReturnType<typeof createAuthClient>;
