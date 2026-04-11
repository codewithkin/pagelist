import prisma from "@pagelist/db";

export interface LibraryStats {
  stats: {
    totalOwned: number;
    currentlyReading: number;
    completed: number;
    wishlist: number;
  };
  currentReads: {
    id: string;
    title: string;
    author: string;
    progress: number;
    coverColor: string;
  }[];
  recentlyAdded: {
    id: string;
    title: string;
    author: string;
    addedAt: string;
  }[];
  monthlyActivity: {
    month: string;
    books: number;
  }[];
}

const COVER_COLORS = ["#D9A826", "#8B7355", "#4A6741", "#6B5B8A", "#A65D57", "#3D7A8A"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getLibraryStats(userId: string): Promise<LibraryStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  const purchases = await prisma.purchase.findMany({
    where: { readerId: userId },
    include: { book: { include: { author: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const totalOwned = purchases.length;

  // No progress tracking model yet; use deterministic color by index
  const currentReads = purchases.slice(0, 2).map((p, i) => ({
    id: p.book.id,
    title: p.book.title,
    author: p.book.author.name,
    progress: 0,
    coverColor: COVER_COLORS[i % COVER_COLORS.length]!,
  }));

  const recentlyAdded = purchases.slice(0, 6).map((p) => ({
    id: p.book.id,
    title: p.book.title,
    author: p.book.author.name,
    addedAt: p.createdAt.toISOString(),
  }));

  // Build monthly activity from purchase dates
  const now = new Date();
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
    const year = now.getFullYear() - (monthIndex > now.getMonth() ? 1 : 0);
    const count = purchases.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    }).length;
    return { month: MONTHS[monthIndex]!, books: count };
  });

  return {
    stats: {
      totalOwned,
      currentlyReading: currentReads.length,
      completed: 0,
      wishlist: 0,
    },
    currentReads,
    recentlyAdded,
    monthlyActivity,
  };
}
