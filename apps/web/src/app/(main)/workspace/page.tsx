"use client";

import { useWorkspaceStats } from "@/hooks/use-workspace";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  UserGroupIcon,
  Dollar01Icon,
  StarIcon,
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

function formatCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statCards = [
  {
    key: "publishedBooks" as const,
    label: "Published Books",
    icon: BookOpen01Icon,
    format: (v: number) => v.toString(),
  },
  {
    key: "totalReaders" as const,
    label: "Total Readers",
    icon: UserGroupIcon,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "monthlyRevenueCents" as const,
    label: "Monthly Revenue",
    icon: Dollar01Icon,
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "avgRating" as const,
    label: "Average Rating",
    icon: StarIcon,
    format: (v: number) => v.toFixed(1),
  },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2 text-xs shadow-sm">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-foreground">{payload[0].value.toLocaleString()} views</p>
    </div>
  );
}

export default function WorkspacePage() {
  const { data, isPending } = useWorkspaceStats();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <HugeiconsIcon icon={Loading04Icon} size={24} className="animate-spin text-muted-foreground" />
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon, format }) => {
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
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {format(value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Views chart */}
      <div className="rounded-xl bg-card ring-1 ring-foreground/8 p-5">
        <h2 className="text-sm font-medium text-foreground mb-4">Monthly Views</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data?.viewsData ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.18} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" vertical={false} />
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
              dataKey="views"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#viewsGrad)"
              dot={false}
              activeDot={{ r: 4, fill: GOLD, stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent books table */}
      <div className="rounded-xl bg-card ring-1 ring-foreground/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Recent Publications</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-muted-foreground font-medium">Title</th>
              <th className="px-5 py-3 text-left text-muted-foreground font-medium">Status</th>
              <th className="px-5 py-3 text-right text-muted-foreground font-medium">Readers</th>
              <th className="px-5 py-3 text-right text-muted-foreground font-medium">Revenue</th>
              <th className="px-5 py-3 text-right text-muted-foreground font-medium">Published</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentBooks ?? []).map((book) => (
              <tr key={book.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{book.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium ${
                      book.status === "published"
                        ? "bg-[#D9A826]/12 text-[#BF901D]"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {book.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {book.readers.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {formatCurrency(book.revenueCents)}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {formatDate(book.publishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
