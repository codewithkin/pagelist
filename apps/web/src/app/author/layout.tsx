"use client";

import { LayoutDashboard, BookOpen, TrendingUp, Banknote, Settings } from "lucide-react";
import ResponsiveNavbar from "@/components/responsive-navbar";
import { ROUTES } from "@/lib/routes";

const authorNav = [
  { href: ROUTES.AUTHOR_WORKSPACE, label: "Workspace", icon: LayoutDashboard },
  { href: ROUTES.AUTHOR_BOOKS, label: "Books", icon: BookOpen },
  { href: ROUTES.AUTHOR_EARNINGS, label: "Earnings", icon: TrendingUp },
  { href: ROUTES.AUTHOR_PAYOUTS, label: "Payouts", icon: Banknote },
  { href: ROUTES.AUTHOR_SETTINGS, label: "Settings", icon: Settings },
];

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[var(--color-brand-surface)]">
      <ResponsiveNavbar
        logo="pagelist"
        logoHref={ROUTES.AUTHOR_WORKSPACE}
        navItems={authorNav}
      />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
