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
import type { AuthorSummary, Sale } from "@/types";
import { format } from "date-fns";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// TODO: replace with real API hook
const MOCK_SUMMARY: AuthorSummary = {
  totalEarnings: 1842.5,
  monthEarnings: 326.0,
  totalBooks: 7,
  totalSold: 214,
  recentSales: [
    { id: "s1", bookId: "b1", bookTitle: "The Art of Solitude", buyerLabel: "Anon #42", price: 14.99, authorCut: 10.49, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "s2", bookId: "b2", bookTitle: "Digital Minimalism", buyerLabel: "Anon #81", price: 9.99, authorCut: 6.99, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "s3", bookId: "b1", bookTitle: "The Art of Solitude", buyerLabel: "Anon #55", price: 14.99, authorCut: 10.49, createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: "s4", bookId: "b3", bookTitle: "On Writing Well", buyerLabel: "Anon #12", price: 11.99, authorCut: 8.39, createdAt: new Date(Date.now() - 28800000).toISOString() },
    { id: "s5", bookId: "b2", bookTitle: "Digital Minimalism", buyerLabel: "Anon #99", price: 9.99, authorCut: 6.99, createdAt: new Date(Date.now() - 43200000).toISOString() },
  ],
};

export default function AuthorWorkspacePage() {
  // TODO: const { data: summary, isLoading } = useAuthorSummary();
  const summary: AuthorSummary = MOCK_SUMMARY;

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
        <StatCard
          label="Total Earnings"
          value={`$${summary.totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          label="This Month"
          value={`$${summary.monthEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          trend={{ value: 12, direction: "up" }}
        />
        <StatCard label="Published Books" value={String(summary.totalBooks)} />
        <StatCard label="Copies Sold" value={String(summary.totalSold)} />
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

        {summary.recentSales.length === 0 ? (
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
