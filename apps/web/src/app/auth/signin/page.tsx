"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message ?? "Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

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
        {error && (
          <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {error}
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
          <Label htmlFor="password">Password</Label>
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
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
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
