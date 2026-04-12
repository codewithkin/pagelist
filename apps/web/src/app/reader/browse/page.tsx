"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Tag } from "lucide-react";
import { Input } from "@pagelist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pagelist/ui/components/select";
import { PageHeader } from "@/components/ui/page-header";
import { BookCard } from "@/components/ui/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { BookPreviewDialog } from "@/components/ui/book-preview-dialog";
import type { Book } from "@/types";
import { useBrowseBooks } from "@/hooks/use-browse";

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

  const [view, setView] = useState<"all" | "sale" | "free">(
    () => (searchParams.get("view") as "all" | "sale" | "free") ?? "all"
  );
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeGenre, setActiveGenre] = useState<string | null>(() => searchParams.get("genre"));
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recent");
  const [buyBook, setBuyBook] = useState<Book | null>(null);

  const { data: allBooks = [], isLoading } = useBrowseBooks();

  const hasFilters = activeGenre !== null || sort !== "recent";

  function clearFilters() {
    setActiveGenre(null);
    setSort("recent");
    setSearch("");
  }

  // sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (view !== "all") params.set("view", view);
    if (search) params.set("q", search);
    if (activeGenre) params.set("genre", activeGenre);
    if (sort !== "recent") params.set("sort", sort);
    const str = params.toString();
    router.replace(str ? `?${str}` : "?", { scroll: false });
  }, [view, search, activeGenre, sort, router]);

  const filtered = useMemo(() => {
    let list = allBooks.filter((b) => {
      if (view === "sale" && b.discountPrice === null) return false;
      if (view === "free" && b.price !== 0) return false;
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

  const saleCount = useMemo(() => allBooks.filter((b) => b.discountPrice !== null).length, [allBooks]);
  const freeCount = useMemo(() => allBooks.filter((b) => b.price === 0).length, [allBooks]);

  return (
    <div className="space-y-8">
      <PageHeader title="Discover thoughtfully curated books." centered />

      {/* View toggle: All / On Sale */}
      <div className="flex items-center gap-1 border-b border-[var(--color-brand-border)]">
        <button
          onClick={() => setView("all")}
          className={`relative px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
            view === "all"
              ? "text-[var(--color-brand-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-brand-primary)]"
              : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          }`}
        >
          All books
        </button>
        <button
          onClick={() => setView("free")}
          className={`relative flex items-center gap-1.5 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
            view === "free"
              ? "text-[var(--color-brand-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-brand-primary)]"
              : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          }`}
        >
          Free
          {freeCount > 0 && (
            <span className="rounded-full bg-[var(--color-brand-primary)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {freeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("sale")}
          className={`relative flex items-center gap-1.5 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
            view === "sale"
              ? "text-[var(--color-brand-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-brand-primary)]"
              : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
          }`}
        >
          <Tag size={13} />
          On sale
          {saleCount > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {saleCount}
            </span>
          )}
        </button>
      </div>

      {/* Category pill bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
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

      <BookPreviewDialog book={buyBook} onClose={() => setBuyBook(null)} />
    </div>
  );
}
