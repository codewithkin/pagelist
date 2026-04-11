import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@pagelist/ui/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-[var(--color-brand-border)] bg-transparent px-3 py-1 text-sm text-[var(--color-brand-primary)] transition-colors outline-none",
        "placeholder:text-[var(--color-brand-muted)]",
        "focus-visible:border-[var(--color-brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]/25",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground",
        "aria-invalid:border-[var(--color-brand-danger)] aria-invalid:ring-1 aria-invalid:ring-[var(--color-brand-danger)]/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
