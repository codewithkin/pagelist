import prisma from "@pagelist/db";

export interface WorkspaceStats {
  stats: {
    publishedBooks: number;
    totalReaders: number;
    monthlyRevenueCents: number;
    avgRating: number;
  };
  recentBooks: {
    id: string;
    title: string;
    status: "published" | "draft";
    readers: number;
    revenueCents: number;
    publishedAt: string;
  }[];
  viewsData: {
    month: string;
    views: number;
  }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getWorkspaceStats(userId: string): Promise<WorkspaceStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [publishedCount, recentBooks, monthPurchasesCents] = await Promise.all([
    prisma.book.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    prisma.book.findMany({
      where: { authorId: userId },
      include: { _count: { select: { purchases: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.purchase.findMany({
      where: { book: { authorId: userId }, createdAt: { gte: startOfMonth } },
      select: { amountPaid: true },
    }),
  ]);

  const totalReaders = await prisma.purchase.count({ where: { book: { authorId: userId } } });
  const monthlyRevenueCents = monthPurchasesCents.reduce((sum, p) => sum + p.amountPaid, 0);

  const recentBooksData = recentBooks.map((b) => ({
    id: b.id,
    title: b.title,
    status: (b.status === "PUBLISHED" ? "published" : "draft") as "published" | "draft",
    readers: b._count.purchases,
    revenueCents: 0, // would need per-book revenue query; simplified here
    publishedAt: b.updatedAt.toISOString(),
  }));

  // Build views data — placeholder (no view tracking model yet); returns zeros
  const viewsData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
    return { month: MONTHS[monthIndex]!, views: 0 };
  });

  return {
    stats: {
      publishedBooks: publishedCount,
      totalReaders,
      monthlyRevenueCents,
      avgRating: 0,
    },
    recentBooks: recentBooksData,
    viewsData,
  };
}
