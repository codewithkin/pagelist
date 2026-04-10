import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  BookOpen01Icon,
  BookCheckIcon,
  BookmarkAdd01Icon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

const navItems = [
  { label: "Collection", href: "/library", icon: Home01Icon },
  { label: "Currently Reading", href: "/library/reading", icon: BookOpen01Icon },
  { label: "Completed", href: "/library/completed", icon: BookCheckIcon },
  { label: "Wishlist", href: "/library/wishlist", icon: BookmarkAdd01Icon },
  { label: "Discover", href: "/library/discover", icon: Search01Icon },
  { label: "Settings", href: "/library/settings", icon: Settings01Icon },
] as const;

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-full grid-cols-[220px_1fr] overflow-hidden">
      <aside className="flex flex-col border-r border-border bg-card overflow-y-auto">
        <div className="px-4 py-5 border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Library
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
