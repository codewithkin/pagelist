"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@pagelist/ui/lib/utils";
import { ROUTES } from "@/lib/routes";

const readerNav = [
  { href: ROUTES.READER_LIBRARY, label: "Library" },
  { href: ROUTES.READER_BROWSE, label: "Browse" },
  { href: ROUTES.READER_ORDERS, label: "Orders" },
  { href: ROUTES.READER_SETTINGS, label: "Settings" },
] as const;

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-[var(--color-brand-surface)]">
      <header className="sticky top-0 z-30 bg-[var(--color-brand-surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href={ROUTES.READER_LIBRARY}
            className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            pagelist
          </Link>

          <nav className="flex items-center gap-1">
            {readerNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-black text-white"
                      : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
