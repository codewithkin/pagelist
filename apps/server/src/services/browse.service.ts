import prisma from "@pagelist/db";

export interface PublicBook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  coverUrl: string | null;
  totalSales: number;
  createdAt: string;
}

export async function getPublishedBooks(): Promise<PublicBook[]> {
  const books = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      _count: { select: { purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author.name,
    description: b.description,
    genre: b.genre,
    language: b.language,
    price: b.priceCents / 100,
    coverUrl: b.coverUrl,
    totalSales: b._count.purchases,
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function getPublishedBook(bookId: string): Promise<PublicBook | null> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      _count: { select: { purchases: true } },
    },
  });
  if (!book) return null;
  return {
    id: book.id,
    title: book.title,
    author: book.author.name,
    description: book.description,
    genre: book.genre,
    language: book.language,
    price: book.priceCents / 100,
    coverUrl: book.coverUrl,
    totalSales: book._count.purchases,
    createdAt: book.createdAt.toISOString(),
  };
}

export interface OrderRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string | null;
  amount: number;
  createdAt: string;
}

export async function getReaderOrders(readerId: string): Promise<OrderRecord[]> {
  const purchases = await prisma.purchase.findMany({
    where: { readerId },
    include: {
      book: {
        include: { author: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return purchases.map((p) => ({
    id: p.id,
    bookId: p.book.id,
    bookTitle: p.book.title,
    bookAuthor: p.book.author.name,
    bookCoverUrl: p.book.coverUrl,
    amount: p.amountPaid / 100,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getReaderLibrary(readerId: string): Promise<
  (PublicBook & { purchasedAt: string })[]
> {
  const purchases = await prisma.purchase.findMany({
    where: { readerId },
    include: {
      book: {
        include: {
          author: { select: { name: true } },
          _count: { select: { purchases: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return purchases.map((p) => ({
    id: p.book.id,
    title: p.book.title,
    author: p.book.author.name,
    description: p.book.description,
    genre: p.book.genre,
    language: p.book.language,
    price: p.book.priceCents / 100,
    coverUrl: p.book.coverUrl,
    totalSales: p.book._count.purchases,
    createdAt: p.book.createdAt.toISOString(),
    purchasedAt: p.createdAt.toISOString(),
  }));
}

export async function purchaseBook(readerId: string, bookId: string): Promise<OrderRecord> {
  const book = await prisma.book.findFirst({ where: { id: bookId, status: "PUBLISHED" } });
  if (!book) throw new Error("Book not found.");

  const existing = await prisma.purchase.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
  });
  if (existing) throw new Error("You already own this book.");

  const purchase = await prisma.purchase.create({
    data: { readerId, bookId, amountPaid: book.priceCents },
    include: {
      book: { include: { author: { select: { name: true } } } },
    },
  });

  return {
    id: purchase.id,
    bookId: purchase.book.id,
    bookTitle: purchase.book.title,
    bookAuthor: purchase.book.author.name,
    bookCoverUrl: purchase.book.coverUrl,
    amount: purchase.amountPaid / 100,
    createdAt: purchase.createdAt.toISOString(),
  };
}
