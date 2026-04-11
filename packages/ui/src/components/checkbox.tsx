"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@pagelist/ui/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-md border border-[var(--color-brand-border)] transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]/25",
        "disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50",
        "aria-invalid:border-[var(--color-brand-danger)] aria-invalid:ring-1 aria-invalid:ring-[var(--color-brand-danger)]/20",
        "data-checked:border-[var(--color-brand-accent)] data-checked:bg-[var(--color-brand-accent)] data-checked:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <HugeiconsIcon icon={Tick01Icon} size={10} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <HugeiconsIcon icon={Tick01Icon} size={10} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
