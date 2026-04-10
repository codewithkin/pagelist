"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";
import { useVerifyEmail } from "@/hooks/use-email-verification";
import { useAuthContext } from "@/components/providers";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthContext();

  const token = searchParams.get("token");
  const { mutate: verifyEmail, isPending, error } = useVerifyEmail();

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token, {
      onSuccess: (data) => {
        // Set session and redirect to onboarding
        if (setSession) {
          setSession(data);
        }
        router.push("/onboarding");
      },
    });
  }, [token, verifyEmail, router, setSession]);

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
      <div className="w-full max-w-sm text-center">
        <h1
          className="mb-3 text-3xl font-light tracking-tight text-foreground"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          {isExpired ? "Link Expired" : "Verification Failed"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isExpired
            ? "Your verification link has expired. Please sign up again to receive a new link."
            : error.message}
        </p>
        <a
          href="/auth/signup"
          className="inline-block bg-[#D9A826] text-[#161312] hover:bg-[#BF901D] px-6 py-2 rounded-xl font-medium text-sm transition-colors"
        >
          Back to Sign Up
        </a>
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
