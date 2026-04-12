"use client";

import { Library, Search, ShoppingBag, Settings } from "lucide-react";
import ResponsiveNavbar from "@/components/responsive-navbar";
import { ROUTES } from "@/lib/routes";

const readerNav = [
  { href: ROUTES.READER_LIBRARY, label: "Library", icon: Library },
  { href: ROUTES.READER_BROWSE, label: "Browse", icon: Search },
  { href: ROUTES.READER_ORDERS, label: "Orders", icon: ShoppingBag },
  { href: ROUTES.READER_SETTINGS, label: "Settings", icon: Settings },
];

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
