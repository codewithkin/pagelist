import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Pagelist",
  description:
    "Pagelist is a curated digital marketplace for independent authors and thoughtful readers.",
};

const VALUES = [
  {
    label: "Curation over volume",
    body: "We believe a smaller catalogue of quality titles is more valuable than an overwhelming sea of mediocrity. Every book on Pagelist is here because it deserves to be read.",
  },
  {
    label: "Authors first",
    body: "Independent authors keep the majority of every sale. We exist to make their work discoverable, not to extract value from it.",
  },
  {
    label: "Quiet by design",
    body: "No algorithmic manipulation, no dark patterns, no attention harvesting. The reading experience is calm, focused, and respectful of your time.",
  },
  {
    label: "Digital, not disposable",
    body: "PDF books you purchase are yours. No subscriptions, no expiry, no DRM. We believe ownership still matters.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      {/* Header */}
      <div className="mb-16 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
          Our story
        </p>
        <h1
          className="text-5xl font-normal leading-tight tracking-tight text-[var(--color-brand-primary)] sm:text-6xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          A quieter place
          <br />
          for books.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--color-brand-muted)]">
          Pagelist was built for two groups of people: independent authors who want their work to
          reach a genuine audience, and readers who are tired of being sold to and simply want to
          find their next great book.
        </p>
      </div>

      {/* Divider */}
      <div className="mb-16 border-t border-[var(--color-brand-border)]" />

      {/* Mission paragraph */}
      <div className="mb-16 grid gap-8 sm:grid-cols-2">
        <div>
          <h2
            className="mb-4 text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Why we exist
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
            The mainstream publishing industry has always favoured volume over depth. Algorithms
            reward engagement over quality. Marketplaces optimise for revenue over reader
            satisfaction.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-brand-muted)]">
            Pagelist is a deliberate alternative. We are a small, focused digital bookstore for PDF
            books — independent titles that deserve a thoughtful audience.
          </p>
        </div>
        <div>
          <h2
            className="mb-4 text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            How it works
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
            Authors upload their books in PDF format, set their own price, and publish directly to
            our catalogue. Readers browse, purchase, and download — keeping their books permanently.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-brand-muted)]">
            There are no subscriptions, no algorithmic feeds, and no advertising. Just books and the
            people who wrote and read them.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-16 border-t border-[var(--color-brand-border)]" />

      {/* Values */}
      <div className="mb-16">
        <p className="mb-10 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-accent)]">
          What we believe
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div
              key={v.label}
              className="rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-6"
            >
              <h3
                className="mb-3 text-lg font-normal text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
              >
                {v.label}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-16 border-t border-[var(--color-brand-border)]" />

      {/* CTA */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className="text-2xl font-normal text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Ready to explore?
          </p>
          <p className="mt-1 text-sm text-[var(--color-brand-muted)]">
            Browse our catalogue or publish your own work.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-[var(--color-brand-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse books
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[var(--color-brand-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-surface-raised)]"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}
