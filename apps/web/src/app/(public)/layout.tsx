import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-brand-surface)]">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
