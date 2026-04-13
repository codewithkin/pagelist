"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicBookCard } from "@/components/public-book-card";
import { useBestSellingBooks } from "@/hooks/use-public";
import { useSession } from "@/hooks/use-auth";

const BOOKS_PER_PAGE = 4;

const TESTIMONIALS = [
  {
    quote:
      "Pagelist introduced me to titles I never would have found through mainstream channels. The curation is genuinely thoughtful.",
    author: "Maya Chen",
    role: "Avid Reader",
  },
  {
    quote:
      "Publishing my first book here was seamless. I had my work in front of real readers within hours of uploading.",
    author: "James Whitmore",
    role: "Independent Author",
  },
  {
    quote:
      "There is something refreshing about a bookstore that actually cares about the reading experience. It shows in every detail.",
    author: "Priya Sharma",
    role: "Literary Blogger",
  },
  {
    quote:
      "I have discovered three of my favourite authors through Pagelist. The discovery experience is unlike anything else.",
    author: "Tobias Dreyer",
    role: "Book Club Organiser",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { session } = useSession();
  const { data, isLoading } = useBestSellingBooks();
  const [page, setPage] = useState(0);

  const handlePublishClick = () => {
    // If not authenticated or is a reader, redirect to signup
    if (!session || session.user.role === "READER") {
      router.push("/signup");
      return;
    }

    // If authenticated as author (WRITER), redirect to author books new page
    if (session.user.role === "WRITER") {
      router.push("/author/books/new");
    }
  };

  const books = data?.books ?? [];
  const totalPages = Math.ceil(Math.max(books.length, 1) / BOOKS_PER_PAGE);
  const visibleBooks = books.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pt-24 pb-20 text-center sm:px-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
          Independent Books · Digital Format
        </p>
        <h1
          className="text-5xl font-normal leading-tight tracking-tight text-[var(--color-brand-primary)] sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Discover books
          <br />
          worth reading.
        </h1>
        <p className="mx-auto mt-6 max-w-prose text-base leading-relaxed text-[var(--color-brand-muted)]">
          A curated marketplace where independent authors share their work and thoughtful readers
          find their next favourite book.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-[var(--color-brand-primary)] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse books
          </Link>
          <button
            onClick={handlePublishClick}
            className="rounded-full border border-[var(--color-brand-border)] px-7 py-3 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-surface-raised)]"
          >
            Publish your book
          </button>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-[var(--color-brand-border)]" />
      </div>

      {/* ── Best Performing Books ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
              Editor's Selection
            </p>
            <h2
              className="text-3xl font-normal text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              Best Performing Books
            </h2>
          </div>
          <Link
            href="/browse?sort=best-selling"
            className="hidden text-sm text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)] sm:block"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-xl bg-[var(--color-brand-border)]"
              />
            ))}
          </div>
        ) : books.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--color-brand-muted)]">
            No books available yet. Check back soon.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {visibleBooks.map((book) => (
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

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)] disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      i === page
                        ? "bg-[var(--color-brand-primary)] text-white"
                        : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)] disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-[var(--color-brand-border)]" />
      </div>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
            Readers &amp; Authors
          </p>
          <h2
            className="text-3xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            What people are saying
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.author}
              className="flex flex-col rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-6"
            >
              <blockquote className="flex-1">
                <p
                  className="text-sm leading-relaxed text-[var(--color-brand-primary)] italic"
                  style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--color-brand-border)] pt-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-semibold text-white">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-brand-primary)]">
                    {t.author}
                  </p>
                  <p className="text-xs text-[var(--color-brand-muted)]">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-[var(--color-brand-primary)] px-8 py-14 text-center">
          <h2
            className="text-3xl font-normal text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Ready to start reading?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Join thousands of readers discovering independent books in digital format.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/browse"
              className="rounded-full bg-[var(--color-brand-accent)] px-7 py-3 text-sm font-medium text-[var(--color-brand-primary)] transition-opacity hover:opacity-90"
            >
              Browse the Collection
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
