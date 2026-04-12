import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
        {/* Left — branding */}
        <div>
          <p
            className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            pagelist
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-brand-muted)]">
            A curated marketplace for independent authors and thoughtful readers.
          </p>
        </div>

        {/* Centre — links */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
            Navigate
          </p>
          <Link href="/browse" className="text-sm text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]">
            Browse
          </Link>
          <Link href="/signup" className="text-sm text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]">
            Publish Your Book
          </Link>
        </div>

        {/* Right — contact */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-primary)]">
            Get in touch
          </p>
          <a
            href="mailto:hello@pagelist.co"
            className="text-sm text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
          >
            hello@pagelist.co
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--color-brand-border)]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-xs text-[var(--color-brand-muted)]">
            &copy; {new Date().getFullYear()} Pagelist. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
