"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Pencil, Archive, Trash2, Eye } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Badge } from "@pagelist/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pagelist/ui/components/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceTag } from "@/components/ui/price-tag";
import { ROUTES } from "@/lib/routes";
import type { Book } from "@/types";
import { format } from "date-fns";

const MOCK_BOOKS: Book[] = [
  { id: "b1", title: "The Art of Solitude", author: "You", description: "A meditation on alone time.", genre: "Self-Help", language: "English", price: 14.99, coverUrl: null, fileUrl: "/files/b1.pdf", status: "PUBLISHED", totalSales: 142, createdAt: "2024-09-10T00:00:00Z", updatedAt: "2024-12-01T00:00:00Z" },
  { id: "b2", title: "Digital Minimalism", author: "You", description: "Living with less tech.", genre: "Technology", language: "English", price: 9.99, coverUrl: null, fileUrl: "/files/b2.pdf", status: "PUBLISHED", totalSales: 53, createdAt: "2024-11-01T00:00:00Z", updatedAt: "2025-01-15T00:00:00Z" },
  { id: "b3", title: "On Writing Well", author: "You", description: "Guide to nonfiction.", genre: "Writing", language: "English", price: 11.99, coverUrl: null, fileUrl: "/files/b3.pdf", status: "PUBLISHED", totalSales: 19, createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-10T00:00:00Z" },
  { id: "b4", title: "Untitled Memoir (Draft)", author: "You", description: "Work in progress.", genre: "Memoir", language: "English", price: 0, coverUrl: null, fileUrl: null, status: "DRAFT", totalSales: 0, createdAt: "2025-06-01T00:00:00Z", updatedAt: "2025-06-10T00:00:00Z" },
  { id: "b5", title: "Old Poems Collection", author: "You", description: "Early poetry work.", genre: "Poetry", language: "English", price: 4.99, coverUrl: null, fileUrl: "/files/b5.pdf", status: "ARCHIVED", totalSales: 8, createdAt: "2023-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];

type TabValue = "PUBLISHED" | "DRAFT" | "ARCHIVED";

const STATUS_BADGE: Record<TabValue, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

export default function AuthorBooksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") as TabValue) || "PUBLISHED";

  const [books] = useState<Book[]>(MOCK_BOOKS);
  const filtered = books.filter((b) => b.status === tab);

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Your Books" subtitle="Manage your published, draft, and archived titles.">
        <Button asChild className="bg-black text-white rounded-full hover:bg-neutral-800">
          <Link href={ROUTES.AUTHOR_BOOKS_NEW}>
            New Book
          </Link>
        </Button>
      </PageHeader>

      <div className="flex gap-2">
        {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === value
                ? "bg-black text-white"
                : "bg-[var(--color-brand-surface-raised)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)]"
            }`}
          >
            {value === "PUBLISHED" ? "Published" : value === "DRAFT" ? "Drafts" : "Archived"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${tab.toLowerCase()} books`}
          description={tab === "PUBLISHED" ? "Upload and publish your first book to see it here." : undefined}
          actionLabel={tab === "DRAFT" ? "Start a new book" : undefined}
          actionHref={tab === "DRAFT" ? ROUTES.AUTHOR_BOOKS_NEW : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => (
            <BookRow key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookRow({ book }: { book: Book }) {
  const badge = STATUS_BADGE[book.status];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] p-4 transition-colors hover:bg-[var(--color-brand-surface-raised)]">
      {/* Cover */}
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--color-brand-primary)]/5">
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="text-[10px] font-medium text-[var(--color-brand-primary)]/40 leading-tight text-center px-1"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {book.title.slice(0, 20)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-[var(--color-brand-primary)]">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-brand-muted)]">
          {book.totalSales} sold &middot; {format(new Date(book.updatedAt), "MMM d, yyyy")}
        </p>
      </div>

      {/* Price */}
      <div className="hidden sm:block">
        {book.price > 0 ? <PriceTag amount={book.price} /> : <span className="text-xs text-[var(--color-brand-muted)]">No price</span>}
      </div>

      {/* Badge */}
      <Badge variant={badge.variant} className="hidden sm:inline-flex">
        {badge.label}
      </Badge>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-brand-muted)]">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.AUTHOR_BOOKS_EDIT(book.id)}>
              <Pencil size={14} className="mr-2" />
              Edit
            </Link>
          </DropdownMenuItem>
          {book.status === "PUBLISHED" && (
            <DropdownMenuItem asChild>
              <Link href={ROUTES.READER_BOOK(book.id)}>
                <Eye size={14} className="mr-2" />
                View as Reader
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-[var(--color-brand-muted)]">
            <Archive size={14} className="mr-2" />
            {book.status === "ARCHIVED" ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[var(--color-brand-danger)]">
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
