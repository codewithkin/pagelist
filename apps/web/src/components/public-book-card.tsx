import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@pagelist/ui/lib/utils";

interface PublicBookCardProps {
  id: string;
  title: string;
  author?: string;
  price: number;
  discountPrice?: number | null;
  coverUrl: string | null;
  isNew?: boolean;
  className?: string;
}

export function PublicBookCard({
  id,
  title,
  author,
  price,
  discountPrice,
  coverUrl,
  isNew,
  className,
}: PublicBookCardProps) {
  const displayPrice = discountPrice ?? price;

  return (
    <Link href={`/book/${id}`} className={cn("group flex flex-col", className)}>
      {/* Cover */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-brand-primary)]">
            <span
              className="px-4 text-center text-sm font-medium leading-tight text-white/80"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              {title}
            </span>
          </div>
        )}

        {/* New badge */}
        {isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            New
          </span>
        )}

        {/* Hover action */}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={14} className="text-[var(--color-brand-primary)]" />
        </span>
      </div>

      {/* Footer row: title left, price right */}
      <div className="flex items-start justify-between pt-3">
        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-1 text-sm font-medium text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-body), 'DM Sans', sans-serif" }}
          >
            {title}
          </h3>
          {author && (
            <p className="mt-0.5 text-xs text-[var(--color-brand-muted)]">{author}</p>
          )}
        </div>
        <span
          className="ml-3 shrink-0 text-sm font-medium text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {discountPrice !== null && discountPrice !== undefined ? (
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-brand-muted)] line-through">${price.toFixed(2)}</span>
              <span>${discountPrice.toFixed(2)}</span>
            </span>
          ) : price === 0 ? (
            "Free"
          ) : (
            `$${price.toFixed(2)}`
          )}
        </span>
      </div>
    </Link>
  );
}
