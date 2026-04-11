"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { useVerifyEmail, useResendVerificationEmail } from "@/hooks/use-email-verification";
import { useAuthContext } from "@/components/providers";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthContext();

  const token = searchParams.get("token");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const { mutate: verifyEmail, isPending, error } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending, error: resendError } = useResendVerificationEmail();

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token, {
      onSuccess: (data) => {
        // Set session and redirect to onboarding
        if (setSession) {
          setSession(data.session);
        }
        router.push("/onboarding");
      },
    });
  }, [token, verifyEmail, router, setSession]);

  function handleResendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    resendVerification(resendEmail, {
      onSuccess: () => {
        setResendSuccess(true);
        setResendEmail("");
        // Auto-hide success after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      },
    });
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Invalid Link
        </h1>
        <p className="text-sm text-muted-foreground">
          This verification link is invalid or missing. Please check your email again.
        </p>
      </div>
    );
  }

  if (error instanceof Error) {
    const isExpired = error.message.includes("expired");
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="mb-3 text-3xl font-light tracking-tight text-foreground"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {isExpired ? "Link Expired" : "Verification Failed"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isExpired
              ? "Your verification link has expired. Request a new one below."
              : error.message}
          </p>
          {!isExpired && (
            <a
              href="/auth/signup"
              className="inline-block bg-[#D9A826] text-[#161312] hover:bg-[#BF901D] px-6 py-2 rounded-xl font-medium text-sm transition-colors"
            >
              Back to Sign Up
            </a>
          )}
        </div>

        {isExpired && (
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-4">
                <strong>Request a new verification email:</strong>
              </p>
              <form onSubmit={handleResendSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="resend-email">Email address</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isResending || resendSuccess}
                    required
                  />
                </div>

                {resendError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {resendError instanceof Error ? resendError.message : "Failed to resend email. Please try again."}
                  </div>
                )}

                {resendSuccess && (
                  <div className="rounded-lg border border-green-300/30 bg-green-50/50 px-3 py-2 text-xs text-green-700">
                    ✓ Verification email sent! Check your inbox for a fresh email link.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!resendEmail.trim() || isResending || resendSuccess}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
              </form>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              <a href="/auth/signup" className="text-[#D9A826] hover:underline">
                Create a new account
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center min-h-screen py-6">
      <div className="text-center">
        <HugeiconsIcon icon={Loading04Icon} size={32} className="animate-spin mx-auto mb-4 text-muted-foreground" />
        <h1
          className="mb-2 text-2xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Verifying your email...
        </h1>
        <p className="text-xs text-muted-foreground">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    </div>
  );
}
