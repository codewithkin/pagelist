"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useSession } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { useCompletePayment, usePaymentStatus } from "@/hooks/use-payments";

interface ViewState {
  type: "loading" | "success" | "error";
  title: string;
  message: string;
}

export default function PaymentSuccessPage() {
  const [viewState, setViewState] = useState<ViewState>({
    type: "loading",
    title: "Verifying your payment",
    message: "Please wait while we confirm your transaction with Paynow.",
  });

  const startedRef = useRef(false);
  const { session, isPending: sessionPending, isAuthenticated } = useSession();
  const intermediatePaymentId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    return url.searchParams.get("intermediatePayment") || "";
  }, []);

  const statusQuery = usePaymentStatus(
    intermediatePaymentId,
    !!intermediatePaymentId && isAuthenticated && !sessionPending,
  );
  const completePayment = useCompletePayment();

  useEffect(() => {
    if (!intermediatePaymentId) {
      setViewState({
        type: "error",
        title: "Missing payment reference",
        message: "We could not find an intermediate payment ID in this URL.",
      });
      return;
    }

    if (sessionPending) return;

    if (!isAuthenticated || !session) {
      const redirect = encodeURIComponent(`${ROUTES.PAYMENT_SUCCESS}?intermediatePayment=${intermediatePaymentId}`);
      setViewState({
        type: "error",
        title: "Sign in required",
        message: `Please sign in first to verify this payment. Continue at ${ROUTES.LOGIN}?redirect=${redirect}`,
      });
      return;
    }

    if (statusQuery.isLoading) return;

    if (statusQuery.error) {
      setViewState({
        type: "error",
        title: "Could not load payment",
        message: statusQuery.error instanceof Error
          ? statusQuery.error.message
          : "Unable to check payment status.",
      });
      return;
    }

    const status = statusQuery.data;
    if (!status || !status.exists) {
      setViewState({
        type: "error",
        title: "Payment not found",
        message: "This payment reference is invalid or no longer exists.",
      });
      return;
    }

    if (status.userMismatch) {
      setViewState({
        type: "error",
        title: "Account mismatch",
        message: "This payment belongs to a different account.",
      });
      return;
    }

    if (status.expired) {
      setViewState({
        type: "error",
        title: "Payment expired",
        message: "This payment link has expired. Please start a new purchase.",
      });
      return;
    }

    if (status.paid) {
      setViewState({
        type: "error",
        title: "Payment already completed",
        message: "This payment has already been verified and applied to your library.",
      });
      return;
    }

    if (status.alreadyOwned) {
      setViewState({
        type: "error",
        title: "Book already owned",
        message: "This book is already in your library, so this payment cannot be completed again.",
      });
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    completePayment
      .mutateAsync(intermediatePaymentId)
      .then((result) => {
        setViewState({
          type: "success",
          title: "Payment successful",
          message: `You now own \"${result.bookTitle}\". It has been added to your library.`,
        });
      })
      .catch((error: unknown) => {
        const fallback = "We could not complete this payment. Please try again.";
        const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : fallback;

        if (message.includes("Payment not found")) {
          setViewState({
            type: "error",
            title: "Payment not found",
            message: "This payment reference is invalid or no longer exists.",
          });
          return;
        }

        if (message.includes("already own")) {
          setViewState({
            type: "error",
            title: "Book already owned",
            message: "This book is already in your library, so this payment cannot be completed again.",
          });
          return;
        }

        if (message.includes("already been completed")) {
          setViewState({
            type: "error",
            title: "Payment already completed",
            message: "This payment has already been verified and applied to your library.",
          });
          return;
        }

        if (message.includes("different account")) {
          setViewState({
            type: "error",
            title: "Account mismatch",
            message: "This payment belongs to a different account.",
          });
          return;
        }

        if (message.includes("expired")) {
          setViewState({
            type: "error",
            title: "Payment expired",
            message: "This payment link has expired. Please start a new purchase.",
          });
          return;
        }

        if (message.includes("not completed on Paynow")) {
          setViewState({
            type: "error",
            title: "Payment not completed",
            message: "Payment was not completed on Paynow. Please try again.",
          });
          return;
        }

        setViewState({
          type: "error",
          title: "Payment failed",
          message,
        });
      });
  }, [
    completePayment,
    intermediatePaymentId,
    isAuthenticated,
    session,
    sessionPending,
    statusQuery.data,
    statusQuery.error,
    statusQuery.isLoading,
  ]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-2xl items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-8 sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          {viewState.type === "loading" && <Loader2 className="size-6 animate-spin text-[var(--color-brand-primary)]" />}
          {viewState.type === "success" && <CheckCircle2 className="size-6 text-green-600" />}
          {viewState.type === "error" && <AlertCircle className="size-6 text-[var(--color-brand-danger)]" />}
          <h1
            className="text-2xl text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {viewState.title}
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">{viewState.message}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {viewState.type === "loading" ? null : (
            <Link
              href={ROUTES.READER_LIBRARY}
              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Go to Library
            </Link>
          )}
          <Link
            href={ROUTES.BROWSE}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-brand-border)] px-6 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-surface-raised)]"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
