import prisma from "@pagelist/db";

/* ── Author profile ──────────────────────────────────────────── */

export interface PublicAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  bookCount: number;
  joinedAt: string;
}

export async function getAuthorProfile(authorId: string): Promise<PublicAuthor | null> {
  const user = await prisma.user.findFirst({
    where: { id: authorId, role: "WRITER" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { books: { where: { status: "PUBLISHED" } } } },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    bio: null, // User model has no bio field yet — safe fallback
    avatarUrl: null,
    bookCount: user._count.books,
    joinedAt: user.createdAt.toISOString(),
  };
}

export interface PublicAuthorBook {
  id: string;
  title: string;
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

export async function getAuthorBooks(authorId: string): Promise<PublicAuthorBook[]> {
  const books = await prisma.book.findMany({
    where: { authorId, status: "PUBLISHED" },
    include: {
      _count: { select: { purchases: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return books.map((b) => {
    const avg =
      b.reviews.length > 0
        ? Math.round((b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length) * 10) / 10
        : 0;
    return {
      id: b.id,
      title: b.title,
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

/* ── Book summary (lightweight for intent callout) ────────────── */

export interface BookSummary {
  id: string;
  title: string;
  coverUrl: string | null;
  price: number;
  discountPrice: number | null;
}

export async function getBookSummary(bookId: string): Promise<BookSummary | null> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      priceCents: true,
      discountPriceCents: true,
    },
  });
  if (!book) return null;
  return {
    id: book.id,
    title: book.title,
    coverUrl: book.coverUrl,
    price: book.priceCents / 100,
    discountPrice: book.discountPriceCents !== null ? book.discountPriceCents / 100 : null,
  };
}

/* ── Extended book detail (includes author ID) ────────────────── */

export interface PublicBookDetail {
  id: string;
  title: string;
  author: string;
  authorId: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  discountPrice: number | null;
  coverUrl: string | null;
  fileUrl: string | null;
  totalSales: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicBookDetail(bookId: string): Promise<PublicBookDetail | null> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { purchases: true, reviews: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!book) return null;
  const avg =
    book.reviews.length > 0
      ? Math.round(
          (book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length) * 10,
        ) / 10
      : 0;
  return {
    id: book.id,
    title: book.title,
    author: book.author.name,
    authorId: book.author.id,
    description: book.description,
    genre: book.genre,
    language: book.language,
    price: book.priceCents / 100,
    discountPrice: book.discountPriceCents !== null ? book.discountPriceCents / 100 : null,
    coverUrl: book.coverUrl,
    fileUrl: book.fileUrl,
    totalSales: book._count.purchases,
    averageRating: avg,
    reviewCount: book._count.reviews,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

/* ── Genre list ───────────────────────────────────────────────── */

export async function getGenres(): Promise<string[]> {
  const books = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    select: { genre: true },
    distinct: ["genre"],
    orderBy: { genre: "asc" },
  });
  return books.map((b) => b.genre);
}

/* ── Catalogue with pagination ────────────────────────────────── */

export interface CatalogueResult {
  books: PublicAuthorBook[];
  total: number;
  hasMore: boolean;
}

export async function getCatalogue(opts: {
  genre?: string;
  sort?: string;
  price?: string;
  q?: string;
  offset?: number;
  limit?: number;
}): Promise<CatalogueResult> {
  const { genre, sort = "recent", price, q, offset = 0, limit = 24 } = opts;

  const where: Record<string, unknown> = { status: "PUBLISHED" as const };
  if (genre) where.genre = genre;
  if (price === "free") where.priceCents = 0;
  if (price === "paid") where.priceCents = { gt: 0 };
  if (q) where.title = { contains: q, mode: "insensitive" };

  type OrderBy = Record<string, string | Record<string, string>>;
  let orderBy: OrderBy = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { priceCents: "asc" };
  if (sort === "price-high") orderBy = { priceCents: "desc" };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        author: { select: { name: true } },
        _count: { select: { purchases: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: sort === "best-selling" ? { purchases: { _count: "desc" } } : orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  const mapped = books.map((b) => {
    const avg =
      b.reviews.length > 0
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

  return { books: mapped, total, hasMore: offset + limit < total };
}
