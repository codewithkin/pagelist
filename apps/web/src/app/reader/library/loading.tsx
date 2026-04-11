import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ReaderLibraryLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-brand-border)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-brand-border)]" />
      </div>
      <LoadingSkeleton variant="book-card" count={8} />
    </div>
  );
}
