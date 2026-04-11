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
import type { Sale, EarningsSummary } from "@/types";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

// TODO: replace with real API hook
const MOCK_SUMMARY: EarningsSummary = {
  totalEarnings: 1842.5,
  totalSales: 214,
  averageSaleValue: 8.61,
  transactions: [
    { id: "s1", bookId: "b1", bookTitle: "The Art of Solitude", buyerLabel: "Anon #42", price: 14.99, authorCut: 10.49, createdAt: "2025-06-10T14:30:00Z" },
    { id: "s2", bookId: "b2", bookTitle: "Digital Minimalism", buyerLabel: "Anon #81", price: 9.99, authorCut: 6.99, createdAt: "2025-06-09T10:15:00Z" },
    { id: "s3", bookId: "b1", bookTitle: "The Art of Solitude", buyerLabel: "Anon #55", price: 14.99, authorCut: 10.49, createdAt: "2025-06-08T08:45:00Z" },
    { id: "s4", bookId: "b3", bookTitle: "On Writing Well", buyerLabel: "Anon #12", price: 11.99, authorCut: 8.39, createdAt: "2025-06-07T16:20:00Z" },
    { id: "s5", bookId: "b2", bookTitle: "Digital Minimalism", buyerLabel: "Anon #99", price: 9.99, authorCut: 6.99, createdAt: "2025-06-05T11:00:00Z" },
    { id: "s6", bookId: "b1", bookTitle: "The Art of Solitude", buyerLabel: "Anon #33", price: 14.99, authorCut: 10.49, createdAt: "2025-06-03T09:30:00Z" },
    { id: "s7", bookId: "b3", bookTitle: "On Writing Well", buyerLabel: "Anon #77", price: 11.99, authorCut: 8.39, createdAt: "2025-06-01T13:00:00Z" },
    { id: "s8", bookId: "b2", bookTitle: "Digital Minimalism", buyerLabel: "Anon #18", price: 9.99, authorCut: 6.99, createdAt: "2025-05-28T07:10:00Z" },
  ],
};

const BOOK_OPTIONS = [
  { value: "all", label: "All Books" },
  { value: "b1", label: "The Art of Solitude" },
  { value: "b2", label: "Digital Minimalism" },
  { value: "b3", label: "On Writing Well" },
];

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

  const summary = MOCK_SUMMARY;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  }

  const filtered = useMemo(() => {
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
  }, [summary.transactions, bookFilter, dateFrom, dateTo, sortKey, sortDir]);

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
        <Button variant="outline" onClick={exportCsv} className="rounded-full border-[var(--color-brand-border)]">
          <Download size={16} className="mr-1.5" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Total Earnings"
          value={`$${summary.totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
        <StatCard label="Total Sales" value={String(summary.totalSales)} />
        <StatCard
          label="Avg Sale Value"
          value={`$${summary.averageSaleValue.toFixed(2)}`}
        />
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
              {BOOK_OPTIONS.map((o) => (
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
      {filtered.length === 0 ? (
        <EmptyState
          title="No sales found"
          description="Adjust your filters or check back later."
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
              {filtered.map((sale) => (
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
