import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@pagelist/ui/components/skeleton";

export default function AuthorBooksLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <Skeleton className="h-10 w-72 rounded-md" />
      <LoadingSkeleton variant="book-row" count={5} />
    </div>
  );
}
