"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@pagelist/ui/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)]/25",
        "data-[size=default]:h-[20px] data-[size=default]:w-[36px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px]",
        "data-checked:bg-[var(--color-brand-accent)] data-unchecked:bg-[var(--color-brand-border)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "aria-invalid:border-[var(--color-brand-danger)] aria-invalid:ring-1 aria-invalid:ring-[var(--color-brand-danger)]/20",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform group-data-[size=default]/switch:size-[16px] group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%+1px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-1px)] group-data-[size=default]/switch:data-unchecked:translate-x-[2px] group-data-[size=sm]/switch:data-unchecked:translate-x-[2px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
