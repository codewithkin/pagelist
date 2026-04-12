"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@pagelist/ui/components/skeleton";
import { PublicBookCard } from "@/components/public-book-card";
import { useAuthorProfile, useAuthorBooks } from "@/hooks/use-public";

export default function AuthorProfilePage() {
  const params = useParams<{ id: string }>();
  const authorId = params.id;

  const { data: author, isLoading } = useAuthorProfile(authorId);
  const { data: books = [] } = useAuthorBooks(authorId);
  const [bioExpanded, setBioExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <p
          className="text-2xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Author not found
        </p>
        <p className="mt-2 text-sm text-[var(--color-brand-muted)]">
          This author profile doesn&apos;t exist or isn&apos;t available.
        </p>
      </div>
    );
  }

  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const bio = author.bio || "";
  const bioIsLong = bio.length > 200;
  const displayBio = bioIsLong && !bioExpanded ? bio.slice(0, 200) + "…" : bio;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* ── Author header ──────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-lg font-semibold text-white">
          {initials}
        </div>
        <h1
          className="mt-4 text-3xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {author.name}
        </h1>
        {bio && (
          <div className="mt-3 max-w-prose">
            <p className="text-base text-[var(--color-brand-muted)]">{displayBio}</p>
            {bioIsLong && (
              <button
                onClick={() => setBioExpanded(!bioExpanded)}
                className="mt-1 text-sm font-medium text-[var(--color-brand-primary)] underline-offset-2 hover:underline"
              >
                {bioExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-[var(--color-brand-muted)]">
          Joined{" "}
          {new Date(author.joinedAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {author.bookCount} book{author.bookCount !== 1 ? "s" : ""} published
        </p>
      </div>

      {/* ── Books grid ─────────────────────────────────────────── */}
      <section className="mt-12">
        <h2
          className="mb-6 text-xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {author.name}&apos;s Books
        </h2>
        {books.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <PublicBookCard
                key={book.id}
                id={book.id}
                title={book.title}
                price={book.price}
                discountPrice={book.discountPrice}
                coverUrl={book.coverUrl}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--color-brand-muted)]">
            No books published yet.
          </p>
        )}
      </section>
    </div>
  );
}
