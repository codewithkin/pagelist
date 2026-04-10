import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D9A826]">
        404
      </p>
      <h1
        className="mb-5 text-5xl font-light tracking-tight text-foreground md:text-7xl"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
      >
        Page not found
      </h1>
      <div className="mb-10 h-px w-12 bg-border" />
      <p className="mb-10 max-w-xs text-sm leading-relaxed text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved to a
        different shelf.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center border border-border bg-background px-7 text-xs uppercase tracking-[0.15em] text-foreground transition-colors duration-200 hover:border-[#D9A826] hover:text-[#D9A826]"
      >
        Return home
      </Link>
    </div>
  );
}
