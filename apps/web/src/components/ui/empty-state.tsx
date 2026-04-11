import { cn } from "@pagelist/ui/lib/utils";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@pagelist/ui/components/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="mb-4">
        {icon ?? <BookOpen size={40} className="text-[var(--color-brand-border)]" />}
      </div>
      <p className="text-base text-[var(--color-brand-muted)]" style={{ fontFamily: "var(--font-body)" }}>
        {title}
      </p>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-[var(--color-brand-muted)]">
          {description}
        </p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild variant="outline" className="rounded-full border-[var(--color-brand-border)] text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <button onClick={onAction} className="text-sm text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] transition-colors">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
