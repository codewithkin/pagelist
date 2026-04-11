import * as React from "react"

import { cn } from "@pagelist/ui/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[var(--color-brand-border)] bg-transparent px-3 py-2.5 text-sm text-[var(--color-brand-primary)] transition-colors outline-none",
        "placeholder:text-[var(--color-brand-muted)]",
        "focus-visible:border-[var(--color-brand-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[var(--color-brand-danger)] aria-invalid:ring-1 aria-invalid:ring-[var(--color-brand-danger)]/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
