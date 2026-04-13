"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon, Loading04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { useSignIn } from "@/hooks/use-auth";
import { useResendVerificationEmail } from "@/hooks/use-email-verification";
import { ApiError } from "@/lib/api-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { mutate: signIn, isPending, error } = useSignIn();
  const { mutate: resendVerification, isPending: isResending } = useResendVerificationEmail();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResendSuccess(false);
    signIn(
      { email, password },
      { onSuccess: () => router.push("/") },
    );
  }

  const isUnverifiedError = error instanceof ApiError && error.status === 403;
  const errorMessage =
    error instanceof Error ? error.message : error ? "Invalid email or password." : null;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your collection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <p>{errorMessage}</p>
            {isUnverifiedError && (
              <p className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    resendVerification(email, {
                      onSuccess: () => {
                        setResendSuccess(true);
                        setTimeout(() => setResendSuccess(false), 4000);
                      },
                    });
                  }}
                  disabled={isResending || resendSuccess || !email}
                  className="font-medium underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isResending ? "Sending..." : resendSuccess ? "Sent! Check your inbox." : "Resend verification email"}
                </button>
              </p>
            )}
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
              className="text-xs text-muted-foreground transition-colors hover:text-[#D9A826]"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                size={14}
              />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading04Icon} size={16} className="animate-spin" />
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 h-px w-full bg-border" />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-foreground transition-colors hover:text-[#D9A826]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
