"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@pagelist/ui/lib/utils";
import { PublicBookCard } from "@/components/public-book-card";
import { useFeaturedBooks, useGenreBooks, useGenres } from "@/hooks/use-public";

const FALLBACK_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "History",
  "Biography",
  "Fantasy",
  "Romance",
  "Mystery",
  "Self-Help",
  "Technology",
];

export default function HomePage() {
  const { data: featured } = useFeaturedBooks();
  const { data: genreList } = useGenres();

  const genres = genreList && genreList.length > 0 ? genreList : FALLBACK_GENRES;
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const selectedGenre = activeGenre ?? (genres[0] || null);

  const { data: genreData } = useGenreBooks(selectedGenre);

  const featuredBooks = featured?.books ?? [];
  const genreBooks = genreData?.books ?? [];

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-16 text-center sm:px-6">
        <h1
          className="text-5xl font-normal leading-tight tracking-tight text-[var(--color-brand-primary)] sm:text-6xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Discover books
          <br />
          worth reading.
        </h1>
        <p className="mx-auto mt-5 max-w-prose text-base text-[var(--color-brand-muted)]">
          A curated marketplace where independent authors share their work and readers find their next favourite book.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Browse Books
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-[var(--color-brand-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-surface-raised)]"
          >
            Publish Your Book
          </Link>
        </div>
      </section>

      {/* ── Featured Books Grid ──────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBooks.map((book) => (
              <PublicBookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                discountPrice={book.discountPrice}
                coverUrl={book.coverUrl}
                isNew
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Genre Filter Bar ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selectedGenre === genre
                  ? "bg-black text-white"
                  : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
              )}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Genre-filtered grid */}
        {genreBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {genreBooks.map((book) => (
                <PublicBookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  discountPrice={book.discountPrice}
                  coverUrl={book.coverUrl}
                />
              ))}
            </div>
            <div className="mt-8 text-right">
              <Link
                href={`/browse?genre=${encodeURIComponent(selectedGenre || "")}`}
                className="text-sm font-medium text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
              >
                See more &rarr;
              </Link>
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--color-brand-muted)]">
            No books in this genre yet.
          </p>
        )}
      </section>
    </div>
  );
}
