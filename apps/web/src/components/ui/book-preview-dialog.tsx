"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ShoppingBag, Star, Tag, Loader2, Check, BookOpen, Globe } from "lucide-react";
import { Dialog, DialogContent } from "@pagelist/ui/components/dialog";
import { Button } from "@pagelist/ui/components/button";
import { BookCover } from "@pagelist/ui/components/book-cover";
import { cn } from "@pagelist/ui/lib/utils";
import type { Book } from "@/types";
import { useBookReviews, useLibraryBooks, usePurchaseBook } from "@/hooks/use-browse";
import { useSession } from "@/hooks/use-auth";
import { useInitiatePayment } from "@/hooks/use-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* ── Star display ──────────────────────────────────────────────── */
function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
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
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────── */
interface BookPreviewDialogProps {
  book: Book | null;
  onClose: () => void;
}

export function BookPreviewDialog({ book, onClose }: BookPreviewDialogProps) {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const { data: reviewData } = useBookReviews(book?.id ?? "");
  const { data: library = [] } = useLibraryBooks();
  const purchaseBook = usePurchaseBook();
  const initiatePayment = useInitiatePayment();

  const [purchasing, setPurchasing] = useState(false);

  if (!book) return null;

  const isOwned = library.some((b) => b.id === book.id);
  const stats = reviewData?.stats;
  const isOnSale = book.discountPrice !== null;
  const activePrice = book.discountPrice ?? book.price;
  const savePct = isOnSale ? Math.round((1 - book.discountPrice! / book.price) * 100) : 0;

  async function handlePurchase() {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      onClose();
      return;
    }
    setPurchasing(true);
    try {
      // Check if book is free or paid
      if (activePrice <= 0) {
        // Free book - instant purchase
        await purchaseBook.mutateAsync(book!.id);
        toast.success(`You now own "${book!.title}". Find it in your library.`);
        onClose();
        return;
      }

      // Paid book - initiate payment
      const payment = await initiatePayment.mutateAsync(book!.id);
      window.location.assign(payment.redirectUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <Dialog open={!!book} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl p-0 overflow-hidden gap-0"
      >
        <div className="flex flex-col sm:flex-row max-h-[85vh] overflow-y-auto">

          {/* Cover column */}
          <div className="relative hidden sm:flex sm:w-[200px] shrink-0 flex-col">
            <div className="relative h-full min-h-[260px] w-full overflow-hidden">
              <BookCover
                coverUrl={book.coverUrl}
                title={book.title}
                className="h-full w-full"
              />
              {isOnSale && (
                <div className="absolute left-0 top-4 rounded-r-full bg-red-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  Sale
                </div>
              )}
            </div>
          </div>

          {/* Content column */}
          <div className="flex flex-1 flex-col gap-5 p-6">

            {/* Mobile cover (small strip) */}
            <div className="relative h-36 w-full overflow-hidden rounded-xl sm:hidden">
              <BookCover
                coverUrl={book.coverUrl}
                title={book.title}
                className="h-full w-full"
              />
              {isOnSale && (
                <div className="absolute left-0 top-3 rounded-r-full bg-red-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  Sale
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full border border-[var(--color-brand-border)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-brand-muted)]">
                <BookOpen size={9} />
                {book.genre}
              </span>
              <span className="flex items-center gap-1 rounded-full border border-[var(--color-brand-border)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-brand-muted)]">
                <Globe size={9} />
                {book.language}
              </span>
              {isOnSale && (
                <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                  <Tag size={9} />
                  {savePct}% off
                </span>
              )}
            </div>

            {/* Title + author */}
            <div>
              <h2
                className="text-2xl font-bold leading-tight text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
              >
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-brand-muted)]">
                by <span className="font-medium text-[var(--color-brand-primary)]">{book.author}</span>
              </p>
            </div>

            {/* Rating */}
            {stats && stats.count > 0 && (
              <div className="flex items-center gap-2">
                <StarDisplay rating={stats.average} />
                <span className="text-sm font-semibold text-[var(--color-brand-primary)]">
                  {stats.average.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--color-brand-muted)]">
                  ({stats.count} review{stats.count !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {/* Description */}
            {book.description && (
              <p className="text-[13px] leading-relaxed text-[var(--color-brand-muted)]">
                {book.description}
              </p>
            )}

            {/* Author detail row */}
            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-brand-surface)] px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[10px] font-semibold text-white">
                {book.author.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-brand-primary)]">{book.author}</p>
                <p className="text-[10px] text-[var(--color-brand-muted)]">Author · {book.genre}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-2.5">
              {isOnSale ? (
                <>
                  <span
                    className="text-3xl font-bold text-[var(--color-brand-primary)]"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    ${book.discountPrice!.toFixed(2)}
                  </span>
                  <span className="mb-0.5 text-base text-[var(--color-brand-muted)] line-through">
                    ${book.price.toFixed(2)}
                  </span>
                  <span className="mb-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    Save {savePct}%
                  </span>
                </>
              ) : (
                <span
                  className="text-3xl font-bold text-[var(--color-brand-primary)]"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  {book.price === 0 ? "Free" : `$${book.price.toFixed(2)}`}
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--color-brand-border)] pt-5">
              {isOwned ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <Check size={16} />
                  You own this book
                </div>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-neutral-800 h-auto"
                >
                  {purchasing ? (
                    <Loader2 size={15} className="mr-2 animate-spin" />
                  ) : (
                    <ShoppingBag size={15} className="mr-2" />
                  )}
                  {!isAuthenticated
                    ? "Sign in to purchase"
                    : book.price === 0
                      ? "Get for free"
                      : `Purchase · $${activePrice.toFixed(2)}`}
                </Button>
              )}

              <Button
                variant="outline"
                asChild
                className="w-full rounded-full border-[var(--color-brand-border)] text-sm"
              >
                <Link href={`/reader/browse/${book.id}`} onClick={onClose}>
                  <ExternalLink size={14} className="mr-2" />
                  View full details
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
