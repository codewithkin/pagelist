"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon, Loading04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { useResetPassword } from "@/hooks/use-auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate: resetPassword, isPending, error, isSuccess } = useResetPassword();

  useEffect(() => {
    if (!token) {
      setLocalError("This reset link is missing a token. Please request a new one.");
    }
  }, [token]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    resetPassword(
      { token, password },
      { onSuccess: () => setTimeout(() => router.push("/auth/signin"), 2500) },
    );
  }

  const errorMessage = localError ?? (error instanceof Error ? error.message : null);

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs tracking-widest text-muted-foreground uppercase">
          Password updated
        </div>
        <h1
          className="mb-4 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          All done
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Button
          onClick={() => router.push("/auth/signin")}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Choose a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Your new password must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {errorMessage}
            {(errorMessage.includes("expired") || errorMessage.includes("invalid")) && (
              <span className="ml-1">
                <Link
                  href="/auth/forgot-password"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  Request a new one.
                </Link>
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={showConfirm ? ViewOffSlashIcon : ViewIcon}
                size={14}
              />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !token}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading04Icon} size={16} className="animate-spin" />
          ) : (
            "Set new password"
          )}
        </Button>
      </form>

      <div className="mt-8 h-px w-full bg-border" />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/auth/signin"
          className="text-foreground transition-colors hover:text-[#D9A826]"
        >
          Return to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
