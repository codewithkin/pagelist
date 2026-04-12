"use client";

import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import Link from "next/link";

export default function RootPage() {

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-brand-surface)]">
      <PublicNav />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl py-20 text-center">
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
      </main>
      <PublicFooter />
    </div>
  );
}

