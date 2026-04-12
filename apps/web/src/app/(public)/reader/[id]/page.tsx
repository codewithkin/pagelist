"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { Book } from "@/types";

/**
 * Public reader profile page
 * Accessible by anyone — no auth required.
 *
 * TODO: Create API endpoint for reader profiles and wire up
 */
export default function ReaderProfilePage() {
  const params = useParams();
  const readerId = params.id as string;

  // TODO: Replace with actual API call
  // const { data: reader, isLoading } = useReaderProfile(readerId);
  // const { data: recentBooks } = useReaderRecentBooks(readerId);

  const [isLoading] = useState(false);

  // Demo data until API is wired up
  const reader = {
    id: readerId,
    name: "Sarah",
    booksRead: 12,
    avgRating: 4.2,
    joinedAt: new Date("2025-06-15").toISOString(),
    bio: "Avid reader of literary fiction and essays. Book lover since childhood.",
  };

  const recentBooks: Book[] = [];

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Reader header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-lg font-semibold text-white">
          {reader.name.slice(0, 1).toUpperCase()}
        </div>

        <h1
          className="mt-4 text-3xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {reader.name}
        </h1>

        {reader.bio && (
          <p className="mt-3 max-w-prose text-base text-[var(--color-brand-muted)]">
            {reader.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
              {reader.booksRead}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-brand-muted)]">
              <BookOpen size={13} />
              Books Read
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold text-[var(--color-brand-primary)]">
              {reader.avgRating.toFixed(1)}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-brand-muted)]">
              <Star size={13} className="fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]" />
              Avg Rating
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-[var(--color-brand-muted)]">
          Joined{" "}
          {new Date(reader.joinedAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Reading activity */}
      <section className="mt-16">
        <h2
          className="mb-8 text-xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Recently Read
        </h2>

        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {recentBooks.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="flex gap-4 rounded-lg border border-[var(--color-brand-border)] p-4 transition-colors hover:bg-[var(--color-brand-surface-raised)]"
              >
                {book.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-20 w-14 rounded object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="line-clamp-1 text-sm font-semibold text-[var(--color-brand-primary)]">
                    {book.title}
                  </p>
                  <p className="text-xs text-[var(--color-brand-muted)]">by {book.author}</p>
                  {book.averageRating > 0 && (
                    <div className="mt-auto flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i < Math.round(book.averageRating)
                              ? "fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]"
                              : "fill-none text-[var(--color-brand-border)]"
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--color-brand-border)] py-12 text-center">
            <p className="text-sm text-[var(--color-brand-muted)]">No reading activity yet.</p>
            <Link
              href="/browse"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-primary)] underline-offset-2 hover:underline"
            >
              Browse books
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
