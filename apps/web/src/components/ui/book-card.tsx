import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@pagelist/ui/lib/utils";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  variant: "library" | "browse";
  isNew?: boolean;
  className?: string;
}

export function BookCard({ book, variant, isNew, className }: BookCardProps) {
  const href = variant === "library" ? `/reader/book/${book.id}` : `/reader/browse/${book.id}`;

  return (
    <Link href={href} className={cn("group flex flex-col cursor-pointer", className)}>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-brand-primary)] transition-transform duration-200 group-hover:scale-[1.02]">
            <span
              className="px-4 text-center text-sm font-medium leading-tight text-white/80"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              {book.title}
            </span>
          </div>
        )}

        {isNew && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            New
          </span>
        )}

        <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={14} className="text-[var(--color-brand-primary)]" />
        </span>
      </div>

      <div className="flex items-start justify-between pt-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold leading-snug text-[var(--color-brand-primary)]",
              variant === "library" ? "line-clamp-2 text-sm" : "line-clamp-1 text-[15px]",
            )}
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {book.title}
          </h3>
          {variant === "browse" && (
            <>
              <p className="mt-0.5 text-xs text-[var(--color-brand-muted)]">{book.author}</p>
              {book.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-brand-muted)]/70">
                  {book.description}
                </p>
              )}
            </>
          )}
        </div>
        {variant === "browse" ? (
          <div className="ml-3 shrink-0 text-right">
            {book.discountPrice !== null ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs line-through text-[var(--color-brand-muted)]">
                  ${book.price.toFixed(2)}
                </span>
                <span
                  className="text-sm font-bold text-[var(--color-brand-primary)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  ${book.discountPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span
                className="text-sm font-semibold text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {book.price === 0 ? "Free" : `$${book.price.toFixed(2)}`}
              </span>
            )}
          </div>
        ) : (
          <span className="ml-3 shrink-0 text-sm text-[var(--color-brand-muted)] transition-colors group-hover:text-[var(--color-brand-primary)]">
            Read &rarr;
          </span>
        )}
      </div>
    </Link>
  );
}
