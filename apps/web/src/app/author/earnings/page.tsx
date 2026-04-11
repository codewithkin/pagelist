"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, ArrowUpDown } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pagelist/ui/components/select";
import { Input } from "@pagelist/ui/components/input";
import { Skeleton } from "@pagelist/ui/components/skeleton";
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
import type { Sale } from "@/types";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { useEarnings } from "@/hooks/use-earnings";

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

export default function AuthorEarningsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookFilter = searchParams.get("book") || "all";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: summary, isLoading } = useEarnings();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  }

  // Build book options dynamically from real transactions
  const bookOptions = useMemo(() => {
    if (!summary) return [{ value: "all", label: "All Books" }];
    const seen = new Map<string, string>();
    for (const t of summary.transactions) {
      if (!seen.has(t.bookId)) seen.set(t.bookId, t.bookTitle);
    }
    return [
      { value: "all", label: "All Books" },
      ...Array.from(seen.entries()).map(([id, title]) => ({ value: id, label: title })),
    ];
  }, [summary]);

  const filtered = useMemo(() => {
    if (!summary) return [];
    let list = summary.transactions;

    if (bookFilter !== "all") {
      list = list.filter((s) => s.bookId === bookFilter);
    }

    if (dateFrom) {
      const from = startOfDay(parseISO(dateFrom));
      list = list.filter((s) => parseISO(s.createdAt) >= from);
    }

    if (dateTo) {
      const to = endOfDay(parseISO(dateTo));
      list = list.filter((s) => parseISO(s.createdAt) <= to);
    }

    list = [...list].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "date") {
        return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return mul * (a.authorCut - b.authorCut);
    });

    return list;
  }, [summary, bookFilter, dateFrom, dateTo, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    const header = "Date,Book,Buyer,Price,Your Cut";
    const rows = filtered.map((s) =>
      [format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"), s.bookTitle, s.buyerLabel, s.price.toFixed(2), s.authorCut.toFixed(2)].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pagelist-earnings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Earnings" subtitle="Track your revenue and sales performance.">
        <Button variant="outline" onClick={exportCsv} className="rounded-full border-[var(--color-brand-border)]" disabled={isLoading || !filtered.length}>
          <Download size={16} className="mr-1.5" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Total Earnings"
              value={`$${(summary?.totalEarnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            />
            <StatCard label="Total Sales" value={String(summary?.totalSales ?? 0)} />
            <StatCard
              label="Avg Sale Value"
              value={`$${(summary?.averageSaleValue ?? 0).toFixed(2)}`}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end justify-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-brand-muted)]">Book</label>
          <Select value={bookFilter} onValueChange={(v) => setParam("book", v)}>
            <SelectTrigger className="w-48 border-[var(--color-brand-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bookOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-brand-muted)]">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setParam("from", e.target.value)}
            className="w-40 border-[var(--color-brand-border)]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-brand-muted)]">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setParam("to", e.target.value)}
            className="w-40 border-[var(--color-brand-border)]"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={summary?.transactions.length === 0 ? "No earnings yet" : "No sales found"}
          description={summary?.transactions.length === 0
            ? "When readers purchase your books, earnings will appear here."
            : "Adjust your filters or check back later."}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--color-brand-border)]">
                <TableHead>
                  <button type="button" className="inline-flex items-center gap-1 text-[var(--color-brand-muted)]" onClick={() => toggleSort("date")}>
                    Date <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="text-[var(--color-brand-muted)]">Book</TableHead>
                <TableHead className="text-[var(--color-brand-muted)]">Buyer</TableHead>
                <TableHead className="text-right text-[var(--color-brand-muted)]">Price</TableHead>
                <TableHead className="text-right">
                  <button type="button" className="inline-flex items-center gap-1 text-[var(--color-brand-muted)]" onClick={() => toggleSort("amount")}>
                    Your Cut <ArrowUpDown size={12} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale: Sale) => (
                <TableRow key={sale.id} className="border-[var(--color-brand-border)]">
                  <TableCell className="text-sm text-[var(--color-brand-muted)]">
                    {format(new Date(sale.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium text-[var(--color-brand-primary)]">{sale.bookTitle}</TableCell>
                  <TableCell className="text-[var(--color-brand-muted)]">{sale.buyerLabel}</TableCell>
                  <TableCell className="text-right"><PriceTag amount={sale.price} /></TableCell>
                  <TableCell className="text-right"><PriceTag amount={sale.authorCut} className="text-[var(--color-brand-accent)]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
