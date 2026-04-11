"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { useForgotPassword } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const { mutate: forgotPassword, isPending, error, isSuccess } = useForgotPassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    forgotPassword({ email });
  }

  const errorMessage = error instanceof Error ? error.message : null;

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs tracking-widest text-muted-foreground uppercase">
          Check your inbox
        </div>
        <h1
          className="mb-4 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Email sent
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          If an account exists for <span className="text-foreground">{email}</span>, you will receive a password reset link shortly. The link expires in 15 minutes.
        </p>
        <div className="h-px w-full bg-border" />
        <p className="mt-6 text-xs text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={() => forgotPassword({ email })}
            className="text-foreground transition-colors hover:text-[#D9A826]"
          >
            Send again
          </button>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
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

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we will send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
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

        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading04Icon} size={16} className="animate-spin" />
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <div className="mt-8 h-px w-full bg-border" />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/auth/signin"
          className="text-foreground transition-colors hover:text-[#D9A826]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
