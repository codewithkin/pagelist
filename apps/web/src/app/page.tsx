"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";

export default function RootPage() {
  const router = useRouter();
  const { session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/auth/signin");
    } else {
      const role = session.user.role;
      if (role === "WRITER") {
        router.replace("/author/workspace");
      } else if (role === "READER") {
        router.replace("/reader/library");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
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
