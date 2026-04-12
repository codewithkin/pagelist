import prisma from "@pagelist/db";

export interface ReviewRecord {
  id: string;
  bookId: string;
  readerId: string;
  readerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

function toRecord(review: {
  id: string;
  bookId: string;
  readerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  reader: { name: string };
}): ReviewRecord {
  return {
    id: review.id,
    bookId: review.bookId,
    readerId: review.readerId,
    readerName: review.reader.name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export async function getBookReviews(bookId: string): Promise<ReviewRecord[]> {
  const reviews = await prisma.review.findMany({
    where: { bookId },
    include: { reader: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(toRecord);
}

export async function getReviewStats(bookId: string): Promise<ReviewStats> {
  const reviews = await prisma.review.findMany({
    where: { bookId },
    select: { rating: true },
  });

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewStats["distribution"];
  let sum = 0;
  for (const r of reviews) {
    dist[r.rating as keyof ReviewStats["distribution"]]++;
    sum += r.rating;
  }

  return {
    average: reviews.length > 0 ? Math.round((sum / reviews.length) * 10) / 10 : 0,
    count: reviews.length,
    distribution: dist,
  };
}

export async function getMyReview(bookId: string, readerId: string): Promise<ReviewRecord | null> {
  const review = await prisma.review.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
    include: { reader: { select: { name: true } } },
  });
  if (!review) return null;
  return toRecord(review);
}

export async function addReview(
  readerId: string,
  bookId: string,
  rating: number,
  comment?: string,
): Promise<ReviewRecord> {
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");

  const book = await prisma.book.findFirst({ where: { id: bookId, status: "PUBLISHED" } });
  if (!book) throw new Error("Book not found.");

  const review = await prisma.review.create({
    data: {
      bookId,
      readerId,
      rating,
      comment: comment?.trim() || null,
    },
    include: { reader: { select: { name: true } } },
  });
  return toRecord(review);
}

export async function updateReview(
  readerId: string,
  bookId: string,
  rating: number,
  comment?: string,
): Promise<ReviewRecord> {
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");

  const existing = await prisma.review.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
  });
  if (!existing) throw new Error("Review not found.");

  const review = await prisma.review.update({
    where: { readerId_bookId: { readerId, bookId } },
    data: { rating, comment: comment?.trim() || null },
    include: { reader: { select: { name: true } } },
  });
  return toRecord(review);
}

export async function deleteReview(readerId: string, bookId: string): Promise<void> {
  const existing = await prisma.review.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
  });
  if (!existing) throw new Error("Review not found.");
  await prisma.review.delete({ where: { readerId_bookId: { readerId, bookId } } });
}
