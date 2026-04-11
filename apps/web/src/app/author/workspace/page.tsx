"use client";

import Link from "next/link";
import { Button } from "@pagelist/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pagelist/ui/components/table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceTag } from "@/components/ui/price-tag";
import { ROUTES } from "@/lib/routes";
import type { Sale } from "@/types";
import { format } from "date-fns";
import { useAuthorSummary } from "@/hooks/use-earnings";
import { Skeleton } from "@pagelist/ui/components/skeleton";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function AuthorWorkspacePage() {
  const { data: summary, isLoading } = useAuthorSummary();

  return (
    <div className="space-y-8">
      <div className="pt-8 pb-6">
        <h1
          className="text-3xl font-normal text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {greeting()}.
        </h1>
        <p className="mt-1 text-sm text-[var(--color-brand-muted)]" style={{ fontFamily: "var(--font-body)" }}>
          Here&apos;s how your books are doing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Total Earnings"
              value={`$${(summary?.totalEarnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            />
            <StatCard
              label="This Month"
              value={`$${(summary?.monthEarnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            />
            <StatCard label="Published Books" value={String(summary?.totalBooks ?? 0)} />
            <StatCard label="Copies Sold" value={String(summary?.totalSold ?? 0)} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-black text-white rounded-full hover:bg-neutral-800">
          <Link href={ROUTES.AUTHOR_BOOKS_NEW}>
            Upload New Book
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[var(--color-brand-border)]">
          <Link href={ROUTES.AUTHOR_BOOKS}>
            Manage Books
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-[var(--color-brand-border)]">
          <Link href={ROUTES.AUTHOR_EARNINGS}>
            View Earnings
          </Link>
        </Button>
      </div>

      {/* Recent Sales */}
      <section className="space-y-4">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Recent Sales
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : !summary || summary.recentSales.length === 0 ? (
          <EmptyState
            title="No sales yet"
            description="Once readers purchase your books, sales will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--color-brand-border)]">
                  <TableHead className="text-[var(--color-brand-muted)]">Book</TableHead>
                  <TableHead className="text-[var(--color-brand-muted)]">Buyer</TableHead>
                  <TableHead className="text-right text-[var(--color-brand-muted)]">Your Cut</TableHead>
                  <TableHead className="text-right text-[var(--color-brand-muted)]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recentSales.map((sale: Sale) => (
                  <TableRow key={sale.id} className="border-[var(--color-brand-border)]">
                    <TableCell className="font-medium text-[var(--color-brand-primary)]">
                      {sale.bookTitle}
                    </TableCell>
                    <TableCell className="text-[var(--color-brand-muted)]">{sale.buyerLabel}</TableCell>
                    <TableCell className="text-right">
                      <PriceTag amount={sale.authorCut} />
                    </TableCell>
                    <TableCell className="text-right text-sm text-[var(--color-brand-muted)]">
                      {format(new Date(sale.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
