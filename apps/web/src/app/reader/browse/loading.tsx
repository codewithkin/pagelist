import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ReaderBrowseLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="h-8 w-32 animate-pulse rounded bg-[var(--color-brand-border)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-brand-border)]" />
      </div>
      <LoadingSkeleton variant="book-card" count={12} />
    </div>
  );
}
