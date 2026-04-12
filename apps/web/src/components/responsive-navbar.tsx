"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@pagelist/ui/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@pagelist/ui/components/sheet";
import { Avatar, AvatarFallback } from "@pagelist/ui/components/avatar";
import { useSession, useSignOut } from "@/hooks/use-auth";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
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
  const router = useRouter();
  const { session } = useSession();
  const signOut = useSignOut();

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleSignOut() {
    await signOut.mutateAsync();
    router.push("/auth/signin");
  }

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
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
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-brand-accent)] text-white"
                    : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface-alt)]",
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="sm:hidden inline-flex items-center justify-center rounded-md p-1.5 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface-alt)] transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent side="right" className="flex flex-col w-[80vw] max-w-xs p-0 bg-[var(--color-brand-surface)]">
            {/* Sheet header — app name + user profile */}
            <div className="px-6 pt-8 pb-5 border-b border-[var(--color-brand-border)]">
              <p
                className="text-xl font-semibold tracking-tight text-[var(--color-brand-primary)] mb-5"
                style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
              >
                pagelist
              </p>
              {user && (
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-[var(--color-brand-accent)] text-white text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-brand-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--color-brand-muted)] truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--color-brand-accent)] text-white"
                        : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface-alt)]",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 border-t border-[var(--color-brand-border)] pt-3">
              <button
                onClick={() => { setOpen(false); handleSignOut(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-brand-muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4 shrink-0" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
