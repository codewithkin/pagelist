import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@pagelist/ui/components/skeleton";

export default function AuthorEarningsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <LoadingSkeleton variant="stat-card" count={3} className="lg:grid-cols-3" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
