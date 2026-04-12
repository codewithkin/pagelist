"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { BookCover } from "@pagelist/ui/components/book-cover";
import { useSignIn } from "@/hooks/use-auth";
import { useBookSummary } from "@/hooks/use-public";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");
  const intent = searchParams.get("intent");
  const intentBookId = searchParams.get("bookId");

  const { data: intentBook } = useBookSummary(intent === "purchase" ? intentBookId : null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signIn, isPending, error } = useSignIn();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Preserve intent in redirect
    let target = redirect || "/";
    if (intent === "purchase" && intentBookId && redirect) {
      const url = new URL(redirect, window.location.origin);
      url.searchParams.set("intent", "purchase");
      url.searchParams.set("bookId", intentBookId);
      target = url.pathname + url.search;
    }
    signIn({ email, password }, { onSuccess: () => router.push(target) });
  }

  const errorMessage =
    error instanceof Error ? error.message : error ? "Invalid email or password." : null;

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            pagelist
          </Link>
        </div>

        {/* Heading */}
        <h1
          className="mb-2 text-center text-2xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Welcome back.
        </h1>

        {/* Purchase intent callout */}
        {intent === "purchase" && intentBook && (
          <div className="mb-6 mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-brand-surface)] p-3">
            <BookCover
              coverUrl={intentBook.coverUrl}
              title={intentBook.title}
              size="sm"
              className="h-12 w-8 shrink-0"
            />
            <p className="text-xs text-[var(--color-brand-muted)]">
              Sign in to purchase{" "}
              <span className="font-medium text-[var(--color-brand-primary)]">
                {intentBook.title}
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-black text-white hover:bg-neutral-800"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-brand-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
          className="font-medium text-[var(--color-brand-primary)] transition-colors hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
