"use client";

import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import Link from "next/link";
import { useFeaturedBooks } from "@/hooks/use-public";
import { PublicBookCard } from "@/components/public-book-card";

export default function RootPage() {
  const { data: catalogueResult, isLoading } = useFeaturedBooks();
  const books = catalogueResult?.books ?? [];

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-brand-surface)]">
      <PublicNav />
      <main className="flex-1 flex flex-col">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6">
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

        {/* ── Featured Books ────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <div className="mb-8 flex items-end justify-between border-b border-[var(--color-brand-border)] pb-4">
            <h2
              className="text-2xl font-normal text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              New &amp; notable
            </h2>
            <Link
              href="/browse"
              className="text-sm text-[var(--color-brand-muted)] hover:text-[var(--color-brand-accent)] transition-colors"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 animate-pulse"
                >
                  <div className="aspect-[2/3] w-full rounded-xl bg-[var(--color-brand-border)]" />
                  <div className="h-3 w-3/4 rounded bg-[var(--color-brand-border)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-brand-border)]" />
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {books.map((book, index) => (
                <PublicBookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  discountPrice={book.discountPrice}
                  coverUrl={book.coverUrl}
                  isNew={index < 2}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-[var(--color-brand-muted)]">
              No books available yet. Check back soon.
            </p>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

