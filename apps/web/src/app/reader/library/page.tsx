"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@pagelist/ui/components/input";
import { PageHeader } from "@/components/ui/page-header";
import { BookCard } from "@/components/ui/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ROUTES } from "@/lib/routes";
import type { Book } from "@/types";
import { useLibraryBooks } from "@/hooks/use-browse";

export default function ReaderLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(query);

  const { data: books = [], isLoading } = useLibraryBooks();

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSearch(value: string) {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Your Library" centered />

      {books.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="pl-9 border-[var(--color-brand-border)] bg-transparent"
          />
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton variant="book-card" count={8} />
      ) : filtered.length === 0 && books.length === 0 ? (
        <EmptyState
          title="Your library is empty"
          description="Books you purchase will appear here."
          actionLabel="Browse books"
          actionHref={ROUTES.READER_BROWSE}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Try a different search term."
          actionLabel="Clear search"
          onAction={() => handleSearch("")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} variant="library" />
          ))}
        </div>
      )}
    </div>
  );
}
