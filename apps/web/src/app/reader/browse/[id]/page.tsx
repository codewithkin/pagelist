"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Star,
  ShoppingBag,
  Check,
  Loader2,
  Trash2,
  Pencil,
  BookOpen,
  Globe,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Textarea } from "@pagelist/ui/components/textarea";
import { Separator } from "@pagelist/ui/components/separator";
import { cn } from "@pagelist/ui/lib/utils";
import { useBookDetail,
  useBookReviews,
  useMyReview,
  useAddReview,
  useUpdateReview,
  useDeleteReview,
  usePurchaseBook,
  useLibraryBooks,
} from "@/hooks/use-browse";
import { useSession } from "@/hooks/use-auth";
import { useInitiatePayment } from "@/hooks/use-payments";
import { toast } from "sonner";
import type { Review } from "@/types";

/* ── Star display (static) ───────────────────────────────────── */

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]"
              : "fill-none text-[var(--color-brand-border)]"
          }
        />
      ))}
    </div>
  );
}

/* ── Star picker (interactive) ───────────────────────────────── */

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              size={28}
              className={cn(
                "transition-colors",
                i <= (hovered || value)
                  ? "fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]"
                  : "fill-none text-[var(--color-brand-border)]",
              )}
            />
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-sm text-[var(--color-brand-muted)]">
          {LABELS[hovered || value]}
        </span>
      )}
    </div>
  );
}

/* ── Review card ─────────────────────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  const initials = review.readerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="space-y-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-semibold text-white">
            {initials}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {review.readerName}
            </p>
            <p className="text-xs text-[var(--color-brand-muted)]">{date}</p>
          </div>
        </div>
        <StarDisplay rating={review.rating} size={13} />
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-[var(--color-brand-secondary,var(--color-brand-muted))]">
          {review.comment}
        </p>
      )}
    </article>
  );
}

/* ── Main page ───────────────────────────────────────────────── */

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const { session, isAuthenticated } = useSession();
  const { data: book, isLoading: bookLoading } = useBookDetail(bookId);
  const { data: reviewData, isLoading: reviewsLoading } = useBookReviews(bookId);
  const { data: myReview } = useMyReview(bookId, isAuthenticated);
  const { data: library = [] } = useLibraryBooks();

  const addReview = useAddReview(bookId);
  const updateReview = useUpdateReview(bookId);
  const deleteReview = useDeleteReview(bookId);
  const purchaseBook = usePurchaseBook();
  const initiatePayment = useInitiatePayment();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [editingReview, setEditingReview] = useState(false);

  // Initialise form from existing review when it loads
  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewComment(myReview.comment ?? "");
    }
  }, [myReview]);

  const isOwned = library.some((b) => b.id === bookId);
  const reviews = reviewData?.reviews ?? [];
  const stats = reviewData?.stats;

  async function handleSubmitReview() {
    if (reviewRating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    try {
      if (myReview && editingReview) {
        await updateReview.mutateAsync({ rating: reviewRating, comment: reviewComment || undefined });
        toast.success("Review updated.");
        setEditingReview(false);
      } else if (!myReview) {
        await addReview.mutateAsync({ rating: reviewRating, comment: reviewComment || undefined });
        toast.success("Thanks for your review!");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit review.");
    }
  }

  async function handleDeleteReview() {
    try {
      await deleteReview.mutateAsync();
      setReviewRating(0);
      setReviewComment("");
      setEditingReview(false);
      toast.success("Review removed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete review.");
    }
  }

  async function handlePurchase() {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }
    if (!book) return;
    try {
      const activePrice = book.discountPrice ?? book.price;

      // Check if book is free or paid
      if (activePrice <= 0) {
        // Free book - instant purchase
        await purchaseBook.mutateAsync(bookId);
        toast.success(`You now own "${book.title}". Find it in your library.`);
        return;
      }

      // Paid book - initiate payment
      const payment = await initiatePayment.mutateAsync(bookId);
      window.location.assign(payment.redirectUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed.");
    }
  }

  // Loading skeleton
  if (bookLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-4 w-40 rounded bg-[var(--color-brand-border)]" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[340px_1fr]">
          <div className="aspect-[2/3] w-full max-w-[340px] rounded-xl bg-[var(--color-brand-border)]" />
          <div className="space-y-4">
            <div className="h-3 w-24 rounded bg-[var(--color-brand-border)]" />
            <div className="h-10 w-3/4 rounded bg-[var(--color-brand-border)]" />
            <div className="h-4 w-32 rounded bg-[var(--color-brand-border)]" />
            <div className="h-24 w-full rounded bg-[var(--color-brand-border)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <BookOpen size={40} className="text-[var(--color-brand-border)]" />
        <h2
          className="text-xl font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Book not found
        </h2>
        <p className="text-sm text-[var(--color-brand-muted)]">
          This title may have been removed or unpublished.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/reader/browse")}
          className="rounded-full border-[var(--color-brand-border)]"
        >
          <ChevronLeft size={14} className="mr-1" />
          Back to browse
        </Button>
      </div>
    );
  }

  const isOnSale = book.discountPrice !== null;
  const activePrice = book.discountPrice ?? book.price;
  const savePct = isOnSale ? Math.round((1 - book.discountPrice! / book.price) * 100) : 0;

  return (
    <div className="space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-brand-muted)]">
        <Link
          href="/reader/browse"
          className="flex items-center gap-1 transition-colors hover:text-[var(--color-brand-primary)]"
        >
          <ChevronLeft size={14} />
          Browse
        </Link>
        <span>/</span>
        <span
          className="max-w-xs truncate text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {book.title}
        </span>
      </nav>

      {/* ── Hero: Cover + Details ── */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[340px_1fr]">

        {/* Cover */}
        <div className="sticky top-6">
          <div className="relative aspect-[2/3] w-full max-w-[340px] overflow-hidden rounded-2xl shadow-[0_12px_48px_rgba(22,19,18,0.12)]">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                unoptimized
                className="object-cover"
                sizes="340px"
                priority
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-[var(--color-brand-primary)] px-8"
              >
                <span
                  className="text-center text-xl font-medium leading-snug text-white/80"
                  style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
                >
                  {book.title}
                </span>
              </div>
            )}
            {isOnSale && (
              <div className="absolute left-0 top-5 rounded-r-full bg-red-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow">
                Sale
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-7">

          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-brand-border)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-brand-muted)]">
              <BookOpen size={11} />
              {book.genre}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-brand-border)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-brand-muted)]">
              <Globe size={11} />
              {book.language}
            </span>
            {isOnSale && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-600">
                <Tag size={11} />
                {savePct}% off
              </span>
            )}
          </div>

          {/* Title + author */}
          <div>
            <h1
              className="text-4xl font-bold leading-tight text-[var(--color-brand-primary)] lg:text-5xl"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              {book.title}
            </h1>
            <p className="mt-2.5 text-base text-[var(--color-brand-muted)]">
              by{" "}
              <span className="font-medium text-[var(--color-brand-primary)]">{book.author}</span>
            </p>
          </div>

          {/* Rating summary */}
          {stats && stats.count > 0 && (
            <div className="flex items-center gap-3">
              <StarDisplay rating={stats.average} size={17} />
              <span className="text-base font-semibold text-[var(--color-brand-primary)]">
                {stats.average.toFixed(1)}
              </span>
              <a
                href="#reviews"
                className="text-sm text-[var(--color-brand-muted)] underline-offset-2 hover:underline"
              >
                {stats.count} review{stats.count !== 1 ? "s" : ""}
              </a>
              {book.totalSales > 0 && (
                <>
                  <span className="text-[var(--color-brand-border)]">·</span>
                  <span className="flex items-center gap-1 text-sm text-[var(--color-brand-muted)]">
                    <Users size={13} />
                    {book.totalSales.toLocaleString()} sold
                  </span>
                </>
              )}
            </div>
          )}

          <Separator className="bg-[var(--color-brand-border)]" />

          {/* Description */}
          {book.description ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-brand-muted)]">
                About this book
              </p>
              <p className="text-[15px] leading-[1.8] text-[var(--color-brand-primary)]/80">
                {book.description}
              </p>
            </div>
          ) : null}

          <Separator className="bg-[var(--color-brand-border)]" />

          {/* Pricing + CTA */}
          <div className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 space-y-5">

            {/* Price display */}
            <div className="flex items-end gap-3">
              {isOnSale ? (
                <>
                  <span
                    className="text-4xl font-bold text-[var(--color-brand-primary)]"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    ${book.discountPrice!.toFixed(2)}
                  </span>
                  <span className="mb-1 text-xl text-[var(--color-brand-muted)] line-through">
                    ${book.price.toFixed(2)}
                  </span>
                  <span className="mb-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    Save {savePct}%
                  </span>
                </>
              ) : (
                <span
                  className="text-4xl font-bold text-[var(--color-brand-primary)]"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {book.price === 0 ? "Free" : `$${book.price.toFixed(2)}`}
                </span>
              )}
            </div>

            {/* CTA */}
            {isOwned ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                <Check size={18} />
                You own this book — read it in your library
              </div>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={purchaseBook.isPending}
                className="w-full rounded-full bg-black py-3 text-[15px] font-medium text-white hover:bg-neutral-800 h-auto"
              >
                {purchaseBook.isPending ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <ShoppingBag size={18} className="mr-2" />
                )}
                {!isAuthenticated
                  ? "Sign in to purchase"
                  : book.price === 0
                    ? "Get for free"
                    : `Purchase for $${activePrice.toFixed(2)}`}
              </Button>
            )}

            {/* Trust line */}
            <p className="text-xs text-[var(--color-brand-muted)]">
              Instant PDF delivery · Secure checkout · 20% goes to the platform
            </p>
          </div>

        </div>
      </div>

      {/* ── Reviews section ── */}
      <section id="reviews" className="scroll-mt-8 space-y-10">
        <div className="flex items-baseline justify-between">
          <h2
            className="text-2xl font-semibold text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Reader Reviews
          </h2>
          {stats && stats.count > 0 && (
            <span className="text-sm text-[var(--color-brand-muted)]">
              {stats.count} review{stats.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Overview + list */}
        {!reviewsLoading && stats && stats.count > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">

            {/* Rating overview */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 self-start">
              <span
                className="text-6xl font-bold text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {stats.average.toFixed(1)}
              </span>
              <StarDisplay rating={stats.average} size={18} />
              <span className="text-xs text-[var(--color-brand-muted)]">
                out of 5 · {stats.count} review{stats.count !== 1 ? "s" : ""}
              </span>

              {/* Distribution */}
              <div className="mt-2 w-full space-y-2">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = stats.distribution[star];
                  const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-2 text-center text-[var(--color-brand-muted)]">{star}</span>
                      <Star
                        size={9}
                        className="shrink-0 fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]"
                      />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-brand-border)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-brand-accent)] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-[var(--color-brand-muted)]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

          </div>
        )}

        {!reviewsLoading && stats?.count === 0 && (
          <p className="py-6 text-sm text-[var(--color-brand-muted)]">
            No reviews yet.{isAuthenticated ? " Be the first to share your thoughts." : ""}
          </p>
        )}

        {/* Write / edit review */}
        {isAuthenticated && (
          <div className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6">

            {myReview && !editingReview ? (
              /* My existing review (read mode) */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--color-brand-primary)]">Your review</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setReviewRating(myReview.rating);
                        setReviewComment(myReview.comment ?? "");
                        setEditingReview(true);
                      }}
                      className="flex items-center gap-1 text-xs text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      disabled={deleteReview.isPending}
                      className="flex items-center gap-1 text-xs text-[var(--color-brand-muted)] transition-colors hover:text-red-500"
                    >
                      {deleteReview.isPending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
                <StarDisplay rating={myReview.rating} size={16} />
                {myReview.comment && (
                  <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
                    {myReview.comment}
                  </p>
                )}
              </div>
            ) : (
              /* Form (write or edit) */
              <div className="space-y-5">
                <div>
                  <p
                    className="mb-1 text-sm font-semibold text-[var(--color-brand-primary)]"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    {myReview ? "Update your review" : "Write a review"}
                  </p>
                  {session && (
                    <p className="text-xs text-[var(--color-brand-muted)]">
                      Reviewing as <span className="font-medium">{session.user.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-muted)]">
                    Rating *
                  </p>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-muted)]">
                    Review (optional)
                  </p>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you think of this book? Share your honest thoughts…"
                    rows={4}
                    className="resize-none border-[var(--color-brand-border)] bg-transparent text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={
                      reviewRating === 0 ||
                      addReview.isPending ||
                      updateReview.isPending
                    }
                    className="rounded-full bg-black text-white hover:bg-neutral-800"
                  >
                    {(addReview.isPending || updateReview.isPending) && (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    )}
                    {myReview ? "Update review" : "Submit review"}
                  </Button>
                  {editingReview && (
                    <Button
                      variant="outline"
                      onClick={() => setEditingReview(false)}
                      className="rounded-full border-[var(--color-brand-border)]"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-[var(--color-brand-muted)]">
            <Link
              href="/auth/signin"
              className="font-medium text-[var(--color-brand-accent)] hover:underline underline-offset-2"
            >
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        )}

      </section>
    </div>
  );
}
