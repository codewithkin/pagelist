"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@pagelist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pagelist/ui/components/select";
import { cn } from "@pagelist/ui/lib/utils";
import { PublicBookCard } from "@/components/public-book-card";
import { useCatalogue, useGenres } from "@/hooks/use-public";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const ITEMS_PER_PAGE = 24;

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [genre, setGenre] = useState<string | null>(searchParams.get("genre"));
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recent");
  const [price, setPrice] = useState<"free" | "paid" | null>(
    (searchParams.get("price") as "free" | "paid" | null),
  );
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [searchOpen, setSearchOpen] = useState(!!q);
  const [limit, setLimit] = useState(ITEMS_PER_PAGE);

  const { data: genreList } = useGenres();
  const genres = genreList ?? [];

  const { data, isLoading } = useCatalogue({
    genre: genre || undefined,
    sort: sort !== "recent" ? sort : undefined,
    price: price || undefined,
    q: q || undefined,
    limit,
  });

  const books = data?.books ?? [];
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (sort !== "recent") params.set("sort", sort);
    if (price) params.set("price", price);
    if (q) params.set("q", q);
    const str = params.toString();
    router.replace(str ? `?${str}` : "/browse", { scroll: false });
  }, [genre, sort, price, q, router]);

  function clearFilters() {
    setGenre(null);
    setSort("recent");
    setPrice(null);
    setQ("");
    setLimit(ITEMS_PER_PAGE);
  }

  const hasFilters = genre !== null || sort !== "recent" || price !== null || q !== "";

  return (
    <div>
      {/* ── Page hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 text-center sm:px-6">
        <h1
          className="text-4xl font-normal tracking-tight text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Browse the catalogue.
        </h1>
        <p className="mt-2 text-sm text-[var(--color-brand-muted)]">
          {total > 0
            ? `${total} book${total !== 1 ? "s" : ""} from independent authors.`
            : "Discover books from independent authors."}
        </p>
      </section>

      {/* ── Filter & control bar ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Tab bar: All / Free / Paid / On Sale */}
        <div className="mb-6 flex items-center gap-1 border-b border-[var(--color-brand-border)]">
          {([
            { value: null, label: "All" },
            { value: "free", label: "Free" },
            { value: "paid", label: "Paid" },
          ] as { value: "free" | "paid" | null; label: string }[]).map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setPrice(tab.value); setLimit(ITEMS_PER_PAGE); }}
              className={cn(
                "relative px-4 pb-3 pt-1 text-sm font-medium transition-colors",
                price === tab.value
                  ? "text-[var(--color-brand-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-brand-primary)]"
                  : "text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Genre chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setGenre(null); setLimit(ITEMS_PER_PAGE); }}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              genre === null
                ? "bg-black text-white"
                : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
            )}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => { setGenre(genre === g ? null : g); setLimit(ITEMS_PER_PAGE); }}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                genre === g
                  ? "bg-black text-white"
                  : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]",
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <Select value={sort} onValueChange={(v) => { setSort(v); setLimit(ITEMS_PER_PAGE); }}>
            <SelectTrigger className="w-44 rounded-full border-[var(--color-brand-border)] bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expandable search */}
          <div className="ml-auto flex items-center">
            {searchOpen ? (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                <Input
                  autoFocus
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setLimit(ITEMS_PER_PAGE); }}
                  onBlur={() => { if (!q) setSearchOpen(false); }}
                  placeholder="Search..."
                  className="w-48 rounded-full border-[var(--color-brand-border)] bg-transparent pl-9 text-sm"
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] transition-colors hover:text-[var(--color-brand-primary)]"
              >
                <Search size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Book Grid ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-[var(--color-brand-border)]" />
                <div className="flex justify-between">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-brand-border)]" />
                  <div className="h-4 w-12 animate-pulse rounded bg-[var(--color-brand-border)]" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen size={40} className="mb-4 text-[var(--color-brand-border)]" />
            <p className="text-sm text-[var(--color-brand-muted)]">No books match your filters.</p>
            {hasFilters && (
              <button
                onClick={() => {
                  setGenre(null);
                  setSort("recent");
                  setPrice(null);
                  setQ("");
                  setLimit(ITEMS_PER_PAGE);
                }}
                className="mt-3 text-sm font-medium text-[var(--color-brand-primary)] underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <PublicBookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  discountPrice={book.discountPrice}
                  coverUrl={book.coverUrl}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setLimit((l) => l + ITEMS_PER_PAGE)}
                  className="rounded-full border border-[var(--color-brand-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-surface-raised)]"
                >
                  Load {ITEMS_PER_PAGE} more
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
