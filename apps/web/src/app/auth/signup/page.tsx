"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Loading04Icon,
  PenTool01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { cn } from "@pagelist/ui/lib/utils";
import { useSignUp } from "@/hooks/use-auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"READER" | "WRITER" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signUp, isPending, error } = useSignUp();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    signUp(
      { name, email, password, role },
      { onSuccess: () => router.push("/") },
    );
  }

  const errorMessage =
    !role && !isPending
      ? null
      : error instanceof Error
        ? error.message
        : error
          ? "Something went wrong. Please try again."
          : null;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join a curated community of readers and writers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
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

        <div className="space-y-3">
          <Label>I want to</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("READER")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border px-4 py-5 transition-all duration-200",
                role === "READER"
                  ? "border-[#D9A826] bg-[#D9A826]/5"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  role === "READER" ? "text-[#D9A826]" : "text-muted-foreground",
                )}
              />
              <span className="text-xs font-medium text-foreground">
                Read books
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                Discover &amp; collect PDFs
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("WRITER")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border px-4 py-5 transition-all duration-200",
                role === "WRITER"
                  ? "border-[#D9A826] bg-[#D9A826]/5"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              <HugeiconsIcon
                icon={PenTool01Icon}
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  role === "WRITER" ? "text-[#D9A826]" : "text-muted-foreground",
                )}
              />
              <span className="text-xs font-medium text-foreground">
                Publish work
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                Share &amp; sell your PDFs
              </span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !role}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading04Icon} size={16} className="animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="mt-8 h-px w-full bg-border" />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
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
