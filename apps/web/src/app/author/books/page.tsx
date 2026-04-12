"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Pencil, Archive, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Badge } from "@pagelist/ui/components/badge";
import { Skeleton } from "@pagelist/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pagelist/ui/components/tabs";
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
import { useAuthorBooks, useUpdateBook, useDeleteBook } from "@/hooks/use-books";
import { toast } from "sonner";

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

  const { data: books = [], isLoading } = useAuthorBooks();

  function setTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  }

  const filtered = books.filter((b) => b.status === tab);

  return (
    <div className="space-y-6">
      <PageHeader title="Your Books" subtitle="Manage your published, draft, and archived titles.">
        <Button asChild className="bg-[var(--color-brand-accent)] text-white rounded-full hover:opacity-90">
          <Link href={ROUTES.AUTHOR_BOOKS_NEW}>
            New Book
          </Link>
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="default">
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
          <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
        </TabsList>

        {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((value) => (
          <TabsContent key={value} value={value}>
            {isLoading ? (
              <div className="space-y-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title={`No ${value.toLowerCase()} books`}
                description={value === "PUBLISHED" ? "Upload and publish your first book to see it here." : undefined}
                actionLabel={value === "DRAFT" ? "Start a new book" : undefined}
                actionHref={value === "DRAFT" ? ROUTES.AUTHOR_BOOKS_NEW : undefined}
              />
            ) : (
              <div className="space-y-3 mt-4">
                {filtered.map((book) => (
                  <BookRow key={book.id} book={book} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function BookRow({ book }: { book: Book }) {
  const badge = STATUS_BADGE[book.status];
  const updateBook = useUpdateBook(book.id);
  const deleteBook = useDeleteBook();

  async function handleArchive() {
    const newStatus = book.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
    try {
      await updateBook.mutateAsync({ status: newStatus });
      toast.success(newStatus === "ARCHIVED" ? "Book archived." : "Book restored.");
    } catch {
      toast.error("Failed to update book status.");
    }
  }

  async function handleDelete() {
    try {
      await deleteBook.mutateAsync(book.id);
      toast.success("Book deleted.");
    } catch {
      toast.error("Failed to delete book.");
    }
  }

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
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-surface)] transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-row">
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
          <DropdownMenuItem onClick={handleArchive} className="text-[var(--color-brand-muted)]">
            {updateBook.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Archive size={14} className="mr-2" />}
            {book.status === "ARCHIVED" ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-[var(--color-brand-danger)]">
            {deleteBook.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Trash2 size={14} className="mr-2" />}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
