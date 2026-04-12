"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, BookOpen, PenTool } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { cn } from "@pagelist/ui/lib/utils";
import { useSignUpWithVerification } from "@/hooks/use-email-verification";
import { useBookSummary } from "@/hooks/use-public";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");
  const intent = searchParams.get("intent");
  const intentBookId = searchParams.get("bookId");

  const { data: intentBook } = useBookSummary(intent === "purchase" ? intentBookId : null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"READER" | "WRITER">(
    intent === "purchase" ? "READER" : "READER", // default reader
  );
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signUp, isPending, error, data } = useSignUpWithVerification();

  // Show verification pending state
  if (data?.pendingVerification) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[var(--color-brand-border)] bg-white p-8 shadow-sm text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2
            className="text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Check your email
          </h2>
          <p className="mt-2 text-sm text-[var(--color-brand-muted)]">
            We&apos;ve sent a verification link to
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--color-brand-primary)]">
            {data.email}
          </p>
          <p className="mt-4 text-xs text-[var(--color-brand-muted)]">
            Click the link in your email to complete signup. It expires in 5 minutes.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    signUp({ name, email, password, role });
  }

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const errorMessage =
    error instanceof Error ? error.message : error ? "Something went wrong." : null;

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

        <h1
          className="mb-2 text-center text-2xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Create your account.
        </h1>

        {/* Purchase intent callout */}
        {intent === "purchase" && intentBook && (
          <div className="mb-6 mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-brand-surface)] p-3">
            {intentBook.coverUrl ? (
              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                <Image
                  src={intentBook.coverUrl}
                  alt={intentBook.title}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : (
              <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-[var(--color-brand-primary)]">
                <span className="text-[8px] font-medium text-white/80">PDF</span>
              </div>
            )}
            <p className="text-xs text-[var(--color-brand-muted)]">
              Sign up to purchase{" "}
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
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              disabled={isPending}
            />
            {passwordMismatch && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          {/* Role picker (hidden if arriving from purchase intent) */}
          {intent !== "purchase" && (
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("READER")}
                  disabled={isPending}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all",
                    role === "READER"
                      ? "border-black bg-black/5"
                      : "border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:border-[var(--color-brand-muted)]",
                  )}
                >
                  <BookOpen size={18} className={role === "READER" ? "text-[var(--color-brand-primary)]" : ""} />
                  <span className="text-xs font-medium">Read books</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("WRITER")}
                  disabled={isPending}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all",
                    role === "WRITER"
                      ? "border-black bg-black/5"
                      : "border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:border-[var(--color-brand-muted)]",
                  )}
                >
                  <PenTool size={18} className={role === "WRITER" ? "text-[var(--color-brand-primary)]" : ""} />
                  <span className="text-xs font-medium">Publish work</span>
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || passwordMismatch}
            className="w-full rounded-full bg-black text-white hover:bg-neutral-800"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : "Create Account"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-brand-muted)]">
        Already have an account?{" "}
        <Link
          href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
          className="font-medium text-[var(--color-brand-primary)] transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
