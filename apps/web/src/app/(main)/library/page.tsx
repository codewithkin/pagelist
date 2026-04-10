"use client";

import { useLibraryStats } from "@/hooks/use-library";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Books01Icon,
  BookOpen01Icon,
  BookCheckIcon,
  BookmarkAdd01Icon,
  Loading04Icon,
} from "@hugeicons/core-free-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GOLD = "#D9A826";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statCards = [
  { key: "totalOwned" as const, label: "Books Owned", icon: Books01Icon },
  { key: "currentlyReading" as const, label: "Currently Reading", icon: BookOpen01Icon },
  { key: "completed" as const, label: "Completed", icon: BookCheckIcon },
  { key: "wishlist" as const, label: "Wishlist", icon: BookmarkAdd01Icon },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2 text-xs shadow-sm">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-foreground">
        {payload[0].value} {payload[0].value === 1 ? "book" : "books"}
      </p>
    </div>
  );
}

export default function LibraryPage() {
  const { data, isPending } = useLibraryStats();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <HugeiconsIcon
          icon={Loading04Icon}
          size={24}
          className="animate-spin text-muted-foreground"
        />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Your Library</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon }) => {
          const value = data?.stats[key] ?? 0;
          return (
            <div
              key={key}
              className="rounded-xl bg-card ring-1 ring-foreground/8 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground/60" />
              </div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Currently reading */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">Currently Reading</h2>
        <div className="grid grid-cols-3 gap-4">
          {(data?.currentReads ?? []).map((book) => (
            <div
              key={book.id}
              className="rounded-xl bg-card ring-1 ring-foreground/8 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-10 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: book.coverColor }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{book.author}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground">Progress</span>
                  <span className="text-[10px] font-medium text-foreground">{book.progress}%</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${book.progress}%`, backgroundColor: GOLD }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart + recently added */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Monthly activity */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/8 p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Monthly Activity</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={data?.monthlyActivity ?? []}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.922 0 0)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "oklch(0.556 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.556 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="books"
                stroke={GOLD}
                strokeWidth={2}
                fill="url(#activityGrad)"
                dot={false}
                activeDot={{ r: 4, fill: GOLD, stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recently added */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/8 overflow-hidden flex flex-col">
          <div className="px-4 py-4 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Recently Added</h2>
          </div>
          <ul className="flex flex-col divide-y divide-border flex-1 overflow-y-auto">
            {(data?.recentlyAdded ?? []).map((book) => (
              <li key={book.id} className="px-4 py-3 hover:bg-secondary/50 transition-colors">
                <p className="text-xs font-medium text-foreground leading-snug">{book.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-muted-foreground">{book.author}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(book.addedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
