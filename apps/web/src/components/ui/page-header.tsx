import { cn } from "@pagelist/ui/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, children, centered, className }: PageHeaderProps) {
  if (centered) {
    return (
      <div className={cn("pt-16 pb-12 text-center", className)}>
        <h1
          className="text-4xl font-normal leading-tight text-[var(--color-brand-primary)] md:text-5xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-md text-base text-[var(--color-brand-muted)]" style={{ fontFamily: "var(--font-body)" }}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1
          className="text-2xl font-normal tracking-tight text-[var(--color-brand-primary)] sm:text-3xl"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-brand-muted)]" style={{ fontFamily: "var(--font-body)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="mt-3 sm:mt-0">{children}</div>}
    </div>
  );
}
