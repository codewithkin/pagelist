import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  BookOpen01Icon,
  ChartAreaIcon,
  Dollar01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

const navItems = [
  { label: "Dashboard", href: "/workspace", icon: Home01Icon },
  { label: "My Books", href: "/workspace/books", icon: BookOpen01Icon },
  { label: "Analytics", href: "/workspace/analytics", icon: ChartAreaIcon },
  { label: "Earnings", href: "/workspace/earnings", icon: Dollar01Icon },
  { label: "Settings", href: "/workspace/settings", icon: Settings01Icon },
] as const;

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-full grid-cols-[220px_1fr] overflow-hidden">
      <aside className="flex flex-col border-r border-border bg-card overflow-y-auto">
        <div className="px-4 py-5 border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Workspace
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <HugeiconsIcon icon={item.icon} size={14} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="overflow-y-auto bg-secondary p-6">{children}</main>
    </div>
  );
}
