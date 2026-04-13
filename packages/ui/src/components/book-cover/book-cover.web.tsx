"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "../../lib/utils";
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
        // Fallback: solid brand background with centered title
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-brand-primary)] p-4">
          <p
            className="line-clamp-3 text-center text-sm font-medium leading-tight text-white/80"
            style={{ fontFamily: "var(--font-display, 'Playfair Display'), serif" }}
          >
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
