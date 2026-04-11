import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@pagelist/ui/components/skeleton";

export default function AuthorPayoutsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <LoadingSkeleton variant="stat-card" count={3} className="lg:grid-cols-3" />
      <div className="rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
