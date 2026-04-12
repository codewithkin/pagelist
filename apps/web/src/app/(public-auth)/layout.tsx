import { PublicNav } from "@/components/public-nav";

export default function PublicAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-brand-surface)]">
      <PublicNav />
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-12">
        {children}
      </div>
    </div>
  );
}
