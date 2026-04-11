import { cn } from "@pagelist/ui/lib/utils";
import { Skeleton } from "@pagelist/ui/components/skeleton";

interface LoadingSkeletonProps {
  variant: "book-card" | "book-row" | "order-row" | "stat-card";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant, count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "book-card") {
    return (
      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {items.map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "book-row") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4">
            <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "order-row") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-raised)] p-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "stat-card") {
    return (
      <div className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}>
        {items.map((i) => (
          <div key={i} className="rounded-xl border border-[var(--color-brand-border)] p-6 space-y-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
