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

// Deterministic mock data until a Books model is added to the schema.
// Values are seeded by the user's account creation time to feel personalised.
function seed(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (Math.imul(31, h) + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const BOOK_TITLES = [
  "The Weight of Ink",
  "Soft Architectures",
  "Between Pages",
  "A Study in Margins",
  "Quiet Meridian",
  "The Annotator",
  "Letters to the Reader",
  "Pale Folio",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getWorkspaceStats(userId: string): Promise<WorkspaceStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  const s = seed(userId);

  const publishedBooks = 4 + (s % 12);
  const totalReaders = 200 + (s % 800);
  const monthlyRevenueCents = 20000 + (s % 150000);
  const avgRating = 4.1 + ((s % 9) / 10);

  const recentBooks = Array.from({ length: Math.min(publishedBooks, 6) }, (_, i) => {
    const si = seed(userId + i);
    return {
      id: `book-${i + 1}`,
      title: BOOK_TITLES[(s + i) % BOOK_TITLES.length]!,
      status: (si % 5 === 0 ? "draft" : "published") as "published" | "draft",
      readers: 10 + (si % 200),
      revenueCents: 500 + (si % 30000),
      publishedAt: new Date(Date.now() - (i + 1) * 12 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  const now = new Date();
  const viewsData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
    const si = seed(userId + `month${i}`);
    return {
      month: MONTHS[monthIndex]!,
      views: 100 + (si % 1200) + i * 30,
    };
  });

  return {
    stats: {
      publishedBooks,
      totalReaders,
      monthlyRevenueCents,
      avgRating: Math.round(avgRating * 10) / 10,
    },
    recentBooks,
    viewsData,
  };
}
