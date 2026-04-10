"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@pagelist/ui/components/sonner";
import { useState, createContext, useContext, ReactNode } from "react";

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

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
