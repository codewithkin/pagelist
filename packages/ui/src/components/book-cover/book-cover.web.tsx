"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "../lib/utils";
import type { BookCoverProps } from "./book-cover.types";

/**
 * BookCover component for web (Next.js)
 * Displays a book cover with automatic fallback to a premium placeholder
 * if the image URL is missing or fails to load.
 */
export function BookCover({
  coverUrl,
  title,
  size = "md",
  className,
  alt,
  onImageError,
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine container dimensions based on size variant
  const sizeClasses = {
    sm: "aspect-[2/3] w-12",
    md: "aspect-[2/3] w-32",
    lg: "aspect-[2/3] w-48",
  };

  const hasValidImage = coverUrl && !imageError;
  const altText = alt || title;

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg", sizeClasses[size], className)}>
      {hasValidImage ? (
        <>
          <Image
            src={coverUrl}
            alt={altText}
            fill
            unoptimized
            className={cn("object-cover transition-all duration-200", isLoading && "blur-sm")}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={handleImageError}
            onLoad={() => setIsLoading(false)}
            priority={false}
          />
        </>
      ) : (
        // Premium placeholder design
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-[var(--color-brand-surface-alt)] via-[var(--color-brand-surface)] to-[var(--color-brand-surface-alt)] p-4">
          {/* Book icon/decoration */}
          <svg
            className="h-1/3 w-1/3 text-[var(--color-brand-muted)] opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 17.753m20-11.5c0 4.478-2.096 8.5-4.8 11.15M12 6.253c5.5 0 10 4.5 10 10.5m-20-10.5v12c0 1.657 4.477 3 10 3s10-1.343 10-3v-12"
            />
          </svg>

          {/* Book title in placeholder */}
          <p
            className="line-clamp-3 text-center text-xs font-medium leading-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display, 'Playfair Display'), serif" }}
          >
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
