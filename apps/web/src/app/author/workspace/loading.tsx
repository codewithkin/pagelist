import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@pagelist/ui/components/skeleton";

export default function AuthorWorkspaceLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat cards */}
      <LoadingSkeleton variant="stat-card" count={4} />

      {/* Quick actions */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Recent sales heading + table skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
