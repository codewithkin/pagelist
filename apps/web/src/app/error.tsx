"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D9A826]">
        Something went wrong
      </p>
      <h1
        className="mb-5 text-4xl font-light tracking-tight text-foreground md:text-5xl"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
      >
        An unexpected error occurred
      </h1>
      <div className="mb-10 h-px w-12 bg-border" />
      <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
        We ran into a problem loading this page. You can try again or return to
        the home page.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 cursor-pointer items-center bg-[#D9A826] px-7 text-xs uppercase tracking-[0.15em] text-[#161312] transition-colors duration-200 hover:bg-[#BF901D]"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex h-10 items-center border border-border bg-background px-7 text-xs uppercase tracking-[0.15em] text-foreground transition-colors duration-200 hover:border-[#D9A826] hover:text-[#D9A826]"
        >
          Return home
        </a>
      </div>
    </div>
  );
}
