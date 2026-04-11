import prisma from "@pagelist/db";

export interface SaleRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  buyerLabel: string;
  price: number;
  authorCut: number;
  createdAt: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalSales: number;
  averageSaleValue: number;
  transactions: SaleRecord[];
}

const PLATFORM_FEE_RATE = 0.2; // 20% platform fee — author gets 80%

export async function getEarningsSummary(authorId: string): Promise<EarningsSummary> {
  const purchases = await prisma.purchase.findMany({
    where: { book: { authorId } },
    include: { book: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const transactions: SaleRecord[] = purchases.map((p, i) => {
    const price = p.amountPaid / 100;
    const authorCut = price * (1 - PLATFORM_FEE_RATE);
    return {
      id: p.id,
      bookId: p.book.id,
      bookTitle: p.book.title,
      buyerLabel: `Anon #${((i + 1) * 37) % 100}`,
      price,
      authorCut: Math.round(authorCut * 100) / 100,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const totalEarnings = transactions.reduce((sum, t) => sum + t.authorCut, 0);
  const totalSales = transactions.length;
  const averageSaleValue = totalSales > 0 ? totalEarnings / totalSales : 0;

  return {
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalSales,
    averageSaleValue: Math.round(averageSaleValue * 100) / 100,
    transactions,
  };
}

export async function getAuthorSummary(authorId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allPurchases, monthPurchases, bookCount] = await Promise.all([
    prisma.purchase.findMany({
      where: { book: { authorId } },
      include: { book: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: { book: { authorId }, createdAt: { gte: startOfMonth } },
    }),
    prisma.book.count({ where: { authorId, status: "PUBLISHED" } }),
  ]);

  const totalSold = await prisma.purchase.count({ where: { book: { authorId } } });

  const totalEarnings = allPurchases.reduce((sum, p) => {
    return sum + (p.amountPaid / 100) * (1 - PLATFORM_FEE_RATE);
  }, 0);

  // Re-fetch all for total calculation
  const allPurchasesForTotal = await prisma.purchase.findMany({
    where: { book: { authorId } },
    select: { amountPaid: true },
  });
  const trueTotal = allPurchasesForTotal.reduce(
    (sum, p) => sum + (p.amountPaid / 100) * (1 - PLATFORM_FEE_RATE),
    0,
  );

  const monthEarnings = monthPurchases.reduce(
    (sum, p) => sum + (p.amountPaid / 100) * (1 - PLATFORM_FEE_RATE),
    0,
  );

  const recentSales = allPurchases.map((p, i) => {
    const price = p.amountPaid / 100;
    const authorCut = price * (1 - PLATFORM_FEE_RATE);
    return {
      id: p.id,
      bookId: p.book.id,
      bookTitle: p.book.title,
      buyerLabel: `Anon #${((i + 1) * 37) % 100}`,
      price,
      authorCut: Math.round(authorCut * 100) / 100,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return {
    totalEarnings: Math.round(trueTotal * 100) / 100,
    monthEarnings: Math.round(monthEarnings * 100) / 100,
    totalBooks: bookCount,
    totalSold,
    recentSales,
  };
}
