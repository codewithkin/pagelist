"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@pagelist/ui/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@pagelist/ui/components/sheet";

interface NavItem {
  href: string;
  label: string;
}

interface ResponsiveNavbarProps {
  logo: string;
  logoHref: string;
  navItems: NavItem[];
}

export default function ResponsiveNavbar({
  logo,
  logoHref,
  navItems,
}: ResponsiveNavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 bg-[var(--color-brand-surface)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href={logoHref}
          className="text-lg font-semibold tracking-tight text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {logo}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => {
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

        {/* Mobile Hamburger Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="sm:hidden inline-flex items-center justify-center rounded-md p-1.5 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface-alt)] transition-colors">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] sm:hidden">
            <div className="flex flex-col gap-4 mt-6">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-base font-medium px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-black text-white"
                        : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface-alt)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
