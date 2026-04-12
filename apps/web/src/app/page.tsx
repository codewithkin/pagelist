"use client";

import { useState } from "react";
import { useFeaturedBooks, useGenreBooks, useGenres } from "@/hooks/use-public";
import { PublicBookCard } from "@/components/public-book-card";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { cn } from "@pagelist/ui/lib/utils";
import Link from "next/link";

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

export default function RootPage() {
  const { data: featured } = useFeaturedBooks();
  const { data: genreList } = useGenres();

  const genres = genreList && genreList.length > 0 ? genreList : FALLBACK_GENRES;
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const selectedGenre = activeGenre ?? (genres[0] || null);

  const { data: genreData } = useGenreBooks(selectedGenre);

  const featuredBooks = featured?.books ?? [];
  const genreBooks = genreData?.books ?? [];

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-brand-surface)]">
      <PublicNav />
      <main className="flex-1">
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
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] rounded-lg transition-colors"
            >
              Browse Catalogue
            </Link>
          </div>
        </section>

        {/* ── Featured ──────────────────────────────────────────────── */}
        {featuredBooks.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2
              className="mb-10 text-3xl font-normal text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              Featured Books
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBooks.map((book) => (
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
          </section>
        )}

        {/* ── Genre books ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-center">
            <h2
              className="text-3xl font-normal text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              {selectedGenre}
            </h2>

            {/* Genre filter — scrollable on mobile, grid on desktop */}
            <div className="flex w-full gap-2 overflow-x-auto pb-2 sm:w-auto sm:overflow-visible sm:pb-0">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g === selectedGenre ? null : g)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeGenre === g
                      ? "bg-[var(--color-brand-accent)] text-white"
                      : "bg-[var(--color-brand-surface-alt)] text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-border)]",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {genreBooks.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
          ) : (
            <div className="text-center text-[var(--color-brand-muted)]">
              <p>No books in this genre yet.</p>
            </div>
          )}
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h2
            className="text-3xl font-normal text-[var(--color-brand-primary)] mb-4"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Ready to explore?
          </h2>
          <p className="text-[var(--color-brand-muted)] mb-6">
            Browse our full catalogue of independent titles.
          </p>
          <Link
            href="/browse"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-[var(--color-brand-accent)] hover:bg-[var(--color-brand-accent-hover)] rounded-lg transition-colors"
          >
            View All Books
          </Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

