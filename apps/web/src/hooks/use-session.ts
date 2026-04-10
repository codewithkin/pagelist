"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import type { SessionData } from "@pagelist/auth/types";

type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; session: SessionData }
  | { status: "unauthenticated" };

export function useSession() {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  const refresh = useCallback(async () => {
    setState({ status: "loading" });
    const session = await authClient.getSession();
    if (session) {
      setState({ status: "authenticated", session });
    } else {
      setState({ status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    session: state.status === "authenticated" ? state.session : null,
    isPending: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
    refresh,
  };
}
