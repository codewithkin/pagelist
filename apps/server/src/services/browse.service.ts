import prisma from "@pagelist/db";

export interface PublicBook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  discountPrice: number | null;
  coverUrl: string | null;
  totalSales: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export async function getPublishedBooks(): Promise<PublicBook[]> {
  const books = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      _count: { select: { purchases: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return books.map((b) => {
    const avg = b.reviews.length > 0
      ? Math.round((b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length) * 10) / 10
      : 0;
    return {
      id: b.id,
      title: b.title,
      author: b.author.name,
      description: b.description,
      genre: b.genre,
      language: b.language,
      price: b.priceCents / 100,
      discountPrice: b.discountPriceCents !== null ? b.discountPriceCents / 100 : null,
      coverUrl: b.coverUrl,
      totalSales: b._count.purchases,
      averageRating: avg,
      reviewCount: b._count.reviews,
      createdAt: b.createdAt.toISOString(),
    };
  });
}

export async function getPublishedBook(bookId: string): Promise<PublicBook | null> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      _count: { select: { purchases: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!book) return null;
  const avg = book.reviews.length > 0
    ? Math.round((book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length) * 10) / 10
    : 0;
  return {
    id: book.id,
    title: book.title,
    author: book.author.name,
    description: book.description,
    genre: book.genre,
    language: book.language,
    price: book.priceCents / 100,
    discountPrice: book.discountPriceCents !== null ? book.discountPriceCents / 100 : null,
    coverUrl: book.coverUrl,
    totalSales: book._count.purchases,
    averageRating: avg,
    reviewCount: book._count.reviews,
    createdAt: book.createdAt.toISOString(),
  };
}

/* ── Get book for reading (published OR user's own books) ─────────────────── */
export async function getBookForReading(
  bookId: string,
  userId?: string | null,
): Promise<PublicBook | null> {
  // Fetch the book with book details first
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      author: { select: { name: true } },
      _count: { select: { purchases: true, reviews: true } },
      reviews: { select: { rating: true } },
      purchases: { where: { readerId: userId || "" }, select: { id: true } },
    },
  });

  if (!book) return null;

  // Check access permissions
  const isPublished = book.status === "PUBLISHED";
  const isAuthor = userId && book.authorId === userId;
  const hasPurchased = userId && book.purchases.length > 0;

  // Allow access if published OR user is author OR user purchased it
  if (!isPublished && !isAuthor && !hasPurchased) {
    return null;
  }

  const avg = book.reviews.length > 0
    ? Math.round((book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length) * 10) / 10
    : 0;

  return {
    id: book.id,
    title: book.title,
    author: book.author.name,
    description: book.description,
    genre: book.genre,
    language: book.language,
    price: book.priceCents / 100,
    discountPrice: book.discountPriceCents !== null ? book.discountPriceCents / 100 : null,
    coverUrl: book.coverUrl,
    totalSales: book._count.purchases,
    averageRating: avg,
    reviewCount: book._count.reviews,
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
    discountPrice: p.book.discountPriceCents !== null ? p.book.discountPriceCents / 100 : null,
    coverUrl: p.book.coverUrl,
    totalSales: p.book._count.purchases,
    averageRating: 0,
    reviewCount: 0,
    createdAt: p.book.createdAt.toISOString(),
    purchasedAt: p.createdAt.toISOString(),
  }));
}

export async function purchaseBook(readerId: string, bookId: string): Promise<OrderRecord> {
  const book = await prisma.book.findFirst({ where: { id: bookId, status: "PUBLISHED" } });
  if (!book) throw new Error("Book not found.");

  // Check if book requires payment
  const bookPrice = book.discountPriceCents ?? book.priceCents;
  if (bookPrice > 0) {
    throw new Error(
      "This book requires payment. Use the payment flow to purchase it.",
    );
  }

  const existing = await prisma.purchase.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
  });
  if (existing) throw new Error("You already own this book.");

  const purchase = await prisma.purchase.create({
    data: { readerId, bookId, amountPaid: 0 },
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
