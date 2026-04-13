"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Loader2, Check } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Skeleton } from "@pagelist/ui/components/skeleton";
import { cn } from "@pagelist/ui/lib/utils";
import { PublicBookCard } from "@/components/public-book-card";
import {
  usePublicBookDetail,
  usePublicBookReviews,
  useAuthorProfile,
  useAuthorBooks,
} from "@/hooks/use-public";
import { useLibraryBooks, usePurchaseBook } from "@/hooks/use-browse";
import { useInitiatePayment } from "@/hooks/use-payments";
import { useSession } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@pagelist/ui/components/dialog";

/* ── Star display ──────────────────────────────────────────────── */
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(rating)
              ? "fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]"
              : "fill-none text-[var(--color-brand-border)]",
          )}
        />
      ))}
    </span>
  );
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = params.id;

  const { isAuthenticated } = useSession();
  const { data: book, isLoading } = usePublicBookDetail(bookId);
  const { data: reviewData } = usePublicBookReviews(bookId);
  const { data: author } = useAuthorProfile(book?.authorId ?? "");
  const { data: authorBooks } = useAuthorBooks(book?.authorId ?? "");
  const { data: library = [] } = useLibraryBooks();
  const purchaseBook = usePurchaseBook();
  const initiatePayment = useInitiatePayment();

  const [descExpanded, setDescExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const isOwned = library.some((b) => b.id === bookId);
  const stats = reviewData?.stats;
  const reviews = reviewData?.reviews ?? [];
  const otherBooks = (authorBooks ?? []).filter((b) => b.id !== bookId).slice(0, 4);

  // Auto-open purchase dialog if intent=purchase and user is authenticated
  useEffect(() => {
    if (searchParams.get("intent") === "purchase" && isAuthenticated && book && !isOwned) {
      setConfirmOpen(true);
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("intent");
      url.searchParams.delete("bookId");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, isAuthenticated, book, isOwned]);

  function handleBuyClick() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/book/${bookId}&intent=purchase&bookId=${bookId}`);
      return;
    }
    if (isOwned) return;
    setConfirmOpen(true);
  }

  async function handleConfirmPurchase() {
    if (!book) return;
    setPurchasing(true);
    try {
      const activeBookPrice = book.discountPrice ?? book.price;

      if (activeBookPrice <= 0) {
        await purchaseBook.mutateAsync(book.id);
        toast.success(`You now own "${book.title}".`);
        setConfirmOpen(false);
        return;
      }

      const payment = await initiatePayment.mutateAsync(book.id);
      window.location.assign(payment.redirectUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr]">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-8 w-1/4 mt-4" />
            <Skeleton className="h-12 w-full mt-4 rounded-full" />
            <Skeleton className="h-32 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <p
          className="text-2xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Book not found
        </p>
        <p className="mt-2 text-sm text-[var(--color-brand-muted)]">
          This book may have been removed or is no longer available.
        </p>
        <Link
          href="/browse"
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Browse books
        </Link>
      </div>
    );
  }

  const activePrice = book.discountPrice ?? book.price;
  const description = book.description || "";
  const isLong = description.length > 800;
  const displayDesc = isLong && !descExpanded ? description.slice(0, 800) + "…" : description;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* ── Two-column layout ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr]">
        {/* Left — Cover */}
        <div>
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-brand-primary)]">
                <span
                  className="px-8 text-center text-lg font-medium leading-snug text-white/80"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {book.title}
                </span>
              </div>
            )}
          </div>

          {/* Mobile-only price + CTA (thumb reachable) */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            <p
              className="text-2xl font-semibold text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {activePrice === 0 ? "Free" : `$${activePrice.toFixed(2)}`}
            </p>
            {isOwned ? (
              <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <Check size={16} /> You own this book
              </div>
            ) : (
              <Button
                onClick={handleBuyClick}
                className="w-full rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-neutral-800 h-auto"
              >
                <ShoppingBag size={15} className="mr-2" />
                Buy This Book
              </Button>
            )}
          </div>
        </div>

        {/* Right — Info */}
        <div>
          {/* Title */}
          <h1
            className="text-4xl font-normal leading-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            {book.title}
          </h1>

          {/* Author */}
          <Link
            href={`/author/${book.authorId}`}
            className="mt-2 inline-block text-base text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
          >
            {book.author}
          </Link>

          {/* Rating */}
          {stats && stats.count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <StarDisplay rating={stats.average} />
              <span className="text-sm font-medium text-[var(--color-brand-primary)]">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--color-brand-muted)]">
                ({stats.count} review{stats.count !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price — desktop */}
          <p
            className="mt-4 hidden text-2xl font-semibold text-[var(--color-brand-primary)] md:block"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {book.discountPrice !== null ? (
              <span className="flex items-baseline gap-2">
                <span>${book.discountPrice.toFixed(2)}</span>
                <span className="text-base text-[var(--color-brand-muted)] line-through">
                  ${book.price.toFixed(2)}
                </span>
              </span>
            ) : activePrice === 0 ? (
              "Free"
            ) : (
              `$${activePrice.toFixed(2)}`
            )}
          </p>

          {/* CTA — desktop */}
          <div className="mt-4 hidden md:block">
            {isOwned ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-700">
                <Check size={16} /> You own this book
              </div>
            ) : (
              <Button
                onClick={handleBuyClick}
                className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white hover:bg-neutral-800 h-auto"
              >
                <ShoppingBag size={15} className="mr-2" />
                Buy This Book
              </Button>
            )}
          </div>

          {/* Genre badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/browse?genre=${encodeURIComponent(book.genre)}`}
              className="rounded-full border border-[var(--color-brand-border)] px-3 py-1 text-xs text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
            >
              {book.genre}
            </Link>
            <span className="rounded-full border border-[var(--color-brand-border)] px-3 py-1 text-xs text-[var(--color-brand-muted)]">
              {book.language}
            </span>
          </div>

          {/* Description */}
          <div className="mt-8">
            <p className="whitespace-pre-line text-base leading-relaxed text-[var(--color-brand-primary)]">
              {displayDesc}
            </p>
            {isLong && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-2 text-sm font-medium text-[var(--color-brand-primary)] underline-offset-2 hover:underline"
              >
                {descExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* About the author */}
          {author && (
            <div className="mt-8 border-t border-[var(--color-brand-border)] pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-semibold text-white">
                  {author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-brand-primary)]">
                    {author.name}
                  </p>
                  {author.bio && (
                    <p className="mt-0.5 text-xs text-[var(--color-brand-muted)] line-clamp-1">
                      {author.bio}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/author/${author.id}`}
                className="mt-3 inline-block text-sm font-medium text-[var(--color-brand-primary)] underline-offset-2 hover:underline"
              >
                View all books by {author.name} &rarr;
              </Link>
            </div>
          )}

          {/* Publication details */}
          <p className="mt-8 text-sm text-[var(--color-brand-muted)]">
            Published{" "}
            {new Date(book.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}{" "}
            · PDF · {book.language}
          </p>
        </div>
      </div>

      {/* ── More by author ───────────────────────────────────────── */}
      {otherBooks.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-brand-border)] pt-12">
          <h2
            className="mb-8 text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            More by {book.author}
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-none">
            {otherBooks.map((b) => (
              <div key={b.id} className="w-48 shrink-0">
                <PublicBookCard
                  id={b.id}
                  title={b.title}
                  price={b.price}
                  discountPrice={b.discountPrice}
                  coverUrl={b.coverUrl}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Reviews ──────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-brand-border)] pt-12">
          <h2
            className="mb-8 text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Reader Reviews
          </h2>
          <div className="space-y-6">
            {reviews.slice(0, 6).map((review) => (
              <div
                key={review.id}
                className="border-b border-[var(--color-brand-border)] pb-6 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} size={12} />
                  <span className="text-sm font-medium text-[var(--color-brand-primary)]">
                    {review.readerName}
                  </span>
                  <span className="text-xs text-[var(--color-brand-muted)]">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-brand-muted)]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Purchase confirmation dialog ────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Confirm your purchase
            </DialogTitle>
            <DialogDescription>
              You&apos;re about to buy <strong>{book.title}</strong> for{" "}
              <strong>{activePrice === 0 ? "free" : `$${activePrice.toFixed(2)}`}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={purchasing}
              className="rounded-full bg-black text-white hover:bg-neutral-800"
            >
              {purchasing ? (
                <Loader2 size={15} className="mr-2 animate-spin" />
              ) : (
                <ShoppingBag size={15} className="mr-2" />
              )}
              Complete Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
