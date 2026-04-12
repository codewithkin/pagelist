"use client";

import ResponsiveNavbar from "@/components/responsive-navbar";
import { ROUTES } from "@/lib/routes";

const readerNav = [
  { href: ROUTES.READER_LIBRARY, label: "Library" },
  { href: ROUTES.READER_BROWSE, label: "Browse" },
  { href: ROUTES.READER_ORDERS, label: "Orders" },
  { href: ROUTES.READER_SETTINGS, label: "Settings" },
] as const;

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[var(--color-brand-surface)]">
      <ResponsiveNavbar
        logo="pagelist"
        logoHref={ROUTES.READER_LIBRARY}
        navItems={readerNav}
      />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
