import { cn } from "@pagelist/ui/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-[var(--color-brand-border)]/50", className)}
      {...props}
    />
  );
}

export { Skeleton };
