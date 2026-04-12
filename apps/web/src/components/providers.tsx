"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@pagelist/ui/components/sonner";
import { useRouter } from "next/navigation";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { setAuthToken, apiClient } from "@/lib/api-client";

interface SessionData {
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

interface AuthContextType {
  session: SessionData | null;
  setSession: (session: SessionData | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within Providers");
  }
  return context;
}

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const [session, setSession] = useState<SessionData | null>(null);

  // Initialize session on mount and listen for auth errors
  useEffect(() => {
    // Try to fetch session from server (only if user is authenticated)
    const initSession = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data?: { session: SessionData } }>(
          "/api/auth/session",
        );
        if (res.data.success && res.data.data?.session) {
          const sessionData = res.data.data.session;
          setSession(sessionData);
          setAuthToken(sessionData.token);
        }
      } catch (e) {
        // Session fetch failed (e.g., 401 for unauthenticated users is expected)
        // This is normal for public pages
        setSession(null);
        setAuthToken(null);
      }
    };

    // Check if there's a session from sign-in/sign-up
    const sessionData = window.sessionStorage?.getItem("auth:session");
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData) as SessionData;
        setSession(session);
        setAuthToken(session.token);
        window.sessionStorage.removeItem("auth:session");
      } catch {
        // Invalid session data
      }
    }

    initSession();

    // Listen for auth errors and redirect to sign-in
    const handleAuthError = () => {
      setSession(null);
      setAuthToken(null);
      router.push("/auth/signin");
    };

    window.addEventListener("auth:unauthorized", handleAuthError);
    return () => window.removeEventListener("auth:unauthorized", handleAuthError);
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
