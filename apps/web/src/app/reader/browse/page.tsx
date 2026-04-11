"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@pagelist/ui/components/input";
import { Button } from "@pagelist/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pagelist/ui/components/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@pagelist/ui/components/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { BookCard } from "@/components/ui/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import type { Book } from "@/types";
import { useBrowseBooks, usePurchaseBook } from "@/hooks/use-browse";
import { toast } from "sonner";

const GENRES = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Fantasy", "Romance", "Mystery", "Self-Help", "Technology"];
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function ReaderBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeGenre, setActiveGenre] = useState<string | null>(() => searchParams.get("genre"));
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recent");
  const [buyBook, setBuyBook] = useState<Book | null>(null);

  const { data: allBooks = [], isLoading } = useBrowseBooks();
  const purchaseBook = usePurchaseBook();

  const hasFilters = activeGenre !== null || sort !== "recent";

  function clearFilters() {
    setActiveGenre(null);
    setSort("recent");
    setSearch("");
  }

  // sync to URL
  useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeGenre) params.set("genre", activeGenre);
    if (sort !== "recent") params.set("sort", sort);
    const str = params.toString();
    router.replace(str ? `?${str}` : "?", { scroll: false });
  }, [search, activeGenre, sort, router]);

  const filtered = useMemo(() => {
    let list = allBooks.filter((b) => {
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeGenre && b.genre !== activeGenre) return false;
      return true;
    });

    if (sort === "best-selling") {
      list = [...list].sort((a, b) => b.totalSales - a.totalSales);
    } else if (sort === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [allBooks, search, activeGenre, sort]);

  async function handleConfirmPurchase() {
    if (!buyBook) return;
    try {
      await purchaseBook.mutateAsync(buyBook.id);
      toast.success(`You now own "${buyBook.title}". Find it in your library.`);
      setBuyBook(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Purchase failed.");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Discover thoughtfully curated books." centered />

      {/* Category pill bar */}
      <div className="mt-8 mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveGenre(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeGenre === null ? "bg-black text-white" : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          }`}
        >
          All
        </button>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeGenre === genre ? "bg-black text-white" : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Search + sort row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books..."
            className="pl-9 border-[var(--color-brand-border)] bg-transparent"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44 border-[var(--color-brand-border)] bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton variant="book-card" count={12} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={allBooks.length === 0 ? "No books available yet" : "No books found"}
            description={allBooks.length === 0
              ? "Check back soon — authors are uploading new titles."
              : "Try adjusting your filters or search term."}
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((book) => (
              <div key={book.id} onClick={() => setBuyBook(book)} className="cursor-pointer">
                <BookCard book={book} variant="browse" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy confirmation dialog */}
      <Dialog open={!!buyBook} onOpenChange={(open) => !open && setBuyBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase <strong>{buyBook?.title}</strong> for{" "}
              <strong>${buyBook?.price.toFixed(2)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyBook(null)} className="rounded-full">Cancel</Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={purchaseBook.isPending}
              className="bg-black text-white rounded-full hover:bg-neutral-800"
            >
              Complete Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
      </Dialog>
    </div>
  );
}
