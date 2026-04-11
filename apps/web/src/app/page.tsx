"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export default function RootPage() {
  const router = useRouter();
  const { session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    // Not signed in → redirect to signin
    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    // Signed in → redirect based on role
    const role = session.user.role;
    if (role === "WRITER") {
      router.replace("/author/workspace");
    } else if (role === "READER") {
      router.replace("/reader/library");
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce"
            style={{ animationDelay: "-0.3s" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce"
            style={{ animationDelay: "-0.15s" }}
          />
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9A826] animate-bounce" />
        </div>
      </div>
    );
  }

  // Show redirecting state while effect runs
  if (session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Redirecting…
        </p>
      </div>
    );
  }

  // Shouldn't reach here, but fallback to empty state
  return null;
}
