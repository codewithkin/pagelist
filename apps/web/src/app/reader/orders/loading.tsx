import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ReaderOrdersLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-brand-border)]" />
        <div className="h-4 w-56 animate-pulse rounded bg-[var(--color-brand-border)]" />
      </div>
      <LoadingSkeleton variant="order-row" count={5} />
    </div>
  );
}
