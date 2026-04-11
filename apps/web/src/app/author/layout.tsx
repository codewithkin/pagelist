"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@pagelist/ui/lib/utils";
import { ROUTES } from "@/lib/routes";

const authorNav = [
  { href: ROUTES.AUTHOR_WORKSPACE, label: "Workspace" },
  { href: ROUTES.AUTHOR_BOOKS, label: "Books" },
  { href: ROUTES.AUTHOR_EARNINGS, label: "Earnings" },
  { href: ROUTES.AUTHOR_PAYOUTS, label: "Payouts" },
  { href: ROUTES.AUTHOR_SETTINGS, label: "Settings" },
] as const;

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-[var(--color-brand-surface)]">
      <header className="sticky top-0 z-30 bg-[var(--color-brand-surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href={ROUTES.AUTHOR_WORKSPACE}
            className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            pagelist
          </Link>

          <nav className="flex items-center gap-1">
            {authorNav.map((item) => {
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
