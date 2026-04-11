import { cn } from "@pagelist/ui/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
}

export function StatCard({ label, value, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-brand-border)] p-6",
        className,
      )}
    >
      <span
        className="text-3xl font-semibold text-[var(--color-brand-primary)]"
        style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
      >
        {value}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-brand-muted)]" style={{ fontFamily: "var(--font-body)" }}>
          {label}
        </p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-500",
            )}
          >
            {trend.direction === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
