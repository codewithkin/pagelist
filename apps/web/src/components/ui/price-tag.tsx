import { cn } from "@pagelist/ui/lib/utils";

interface PriceTagProps {
  amount: number;
  className?: string;
}

export function PriceTag({ amount, className }: PriceTagProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

  return (
    <span
      className={cn("font-semibold text-[var(--color-brand-primary)]", className)}
      style={{ fontFamily: "var(--font-mono), 'JetBrains Mono', monospace" }}
    >
      {formatted}
    </span>
  );
}
