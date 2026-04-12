"use client";

import Link from "next/link";
import { format } from "date-fns";
import { BookCover } from "@pagelist/ui/components/book-cover";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PriceTag } from "@/components/ui/price-tag";
import { ROUTES } from "@/lib/routes";
import { useOrders } from "@/hooks/use-browse";

export default function ReaderOrdersPage() {
  const { data: orders = [], isLoading } = useOrders();

  return (
    <div className="space-y-8">
      <PageHeader title="Order History" subtitle="Every book you have purchased." />

      {isLoading ? (
        <LoadingSkeleton variant="order-row" count={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you purchase a book, it will appear here."
          actionLabel="Browse books"
          actionHref={ROUTES.READER_BROWSE}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4"
            >
            <div className="shrink-0">
              <BookCover
                coverUrl={order.bookCoverUrl}
                title={order.bookTitle}
                size="sm"
                className="h-12 w-8"
              />
            </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-brand-primary)]">
                  {order.bookTitle}
                </p>
                <p className="text-xs text-[var(--color-brand-muted)]">{order.bookAuthor}</p>
              </div>

              <p className="hidden text-xs text-[var(--color-brand-muted)] sm:block">
                {format(new Date(order.createdAt), "d MMMM yyyy")}
              </p>

              <PriceTag amount={order.amount} className="text-sm" />

              <div className="flex items-center gap-3">
                <Link
                  href={`/reader/book/${order.bookId}`}
                  className="text-xs font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-accent)] transition-colors"
                >
                  Read
                </Link>
                <button className="text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] transition-colors">
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
