import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr]">
      <div className="flex flex-col items-center pt-8 pb-2">
        <Link
          href="/"
          className="text-lg tracking-[0.2em] uppercase text-foreground transition-colors hover:text-[#D9A826]"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          PageList
        </Link>
        <div className="mt-4 h-px w-8 bg-border" />
      </div>
      <div className="flex items-start justify-center px-4 pb-12 pt-4">
        {children}
      </div>
    </div>
  );
}
