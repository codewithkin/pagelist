"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/hooks/use-session";

export default function HomePage() {
  const router = useRouter();
  const { session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      const role = session.user.role;
      if (role === "WRITER") {
        router.replace("/workspace" as never);
      } else {
        router.replace("/library" as never);
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
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

  if (session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D9A826]">
        Welcome to
      </p>
      <h1
        className="mb-5 text-5xl font-light tracking-tight text-foreground md:text-7xl"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
      >
        PageList
      </h1>
      <div className="mb-8 h-px w-12 bg-border" />
      <p className="mb-12 max-w-sm text-sm leading-relaxed text-muted-foreground">
        A curated space for readers and writers. Discover, collect, and publish
        digital books in a quieter corner of the internet.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signup"
          className="inline-flex h-10 items-center bg-[#D9A826] px-7 text-xs uppercase tracking-[0.15em] text-[#161312] transition-colors duration-200 hover:bg-[#BF901D]"
        >
          Create account
        </Link>
        <Link
          href="/auth/signin"
          className="inline-flex h-10 items-center border border-border bg-background px-7 text-xs uppercase tracking-[0.15em] text-foreground transition-colors duration-200 hover:border-[#D9A826] hover:text-[#D9A826]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
