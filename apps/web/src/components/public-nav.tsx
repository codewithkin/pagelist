"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@pagelist/ui/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@pagelist/ui/components/sheet";
import { useSession } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "/browse", label: "Browse Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function PublicNav() {
  const pathname = usePathname();
  const { session } = useSession();
  const [open, setOpen] = useState(false);

  const dashboardHref = session
    ? session.user.role === "WRITER"
      ? "/author/workspace"
      : "/reader/library"
    : null;

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          pagelist
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide uppercase transition-colors",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-[var(--color-brand-primary)]"
                  : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
              )}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <Link
              href={dashboardHref!}
              className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="sm:hidden inline-flex items-center justify-center rounded-md p-1.5 text-[var(--color-brand-primary)]">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col w-[80vw] max-w-xs p-0 bg-[var(--color-brand-surface)]">
            <div className="px-6 pt-8 pb-5 border-b border-[var(--color-brand-border)]">
              <p
                className="text-xl font-semibold tracking-tight text-[var(--color-brand-primary)]"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
              >
                pagelist
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-1 px-3 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-black text-white"
                      : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-3 pb-6 border-t border-[var(--color-brand-border)] pt-3 flex flex-col gap-2">
              {session ? (
                <Link
                  href={dashboardHref!}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-black px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-[var(--color-brand-border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--color-brand-primary)]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-black px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
