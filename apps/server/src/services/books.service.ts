import prisma from "@pagelist/db";
import type { BookStatus } from "@pagelist/db/prisma/generated/enums";

export interface BookRecord {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  price: number; // dollars, derived from priceCents
  coverUrl: string | null;
  fileUrl: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

function toRecord(
  book: {
    id: string;
    title: string;
    description: string;
    genre: string;
    language: string;
    priceCents: number;
    coverUrl: string | null;
    fileUrl: string | null;
    status: BookStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: { purchases: number };
  },
): BookRecord {
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    genre: book.genre,
    language: book.language,
    price: book.priceCents / 100,
    coverUrl: book.coverUrl,
    fileUrl: book.fileUrl,
    status: book.status as "PUBLISHED" | "DRAFT" | "ARCHIVED",
    totalSales: book._count.purchases,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

export async function getAuthorBooks(authorId: string): Promise<BookRecord[]> {
  const books = await prisma.book.findMany({
    where: { authorId },
    include: { _count: { select: { purchases: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return books.map(toRecord);
}

export async function getAuthorBook(bookId: string, authorId: string): Promise<BookRecord | null> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, authorId },
    include: { _count: { select: { purchases: true } } },
  });
  if (!book) return null;
  return toRecord(book);
}

export interface CreateBookInput {
  title: string;
  description: string;
  genre: string;
  language: string;
  priceCents: number;
  coverUrl?: string | null;
  fileUrl?: string | null;
  status?: BookStatus;
}

export async function createBook(authorId: string, input: CreateBookInput): Promise<BookRecord> {
  const book = await prisma.book.create({
    data: {
      authorId,
      title: input.title,
      description: input.description,
      genre: input.genre,
      language: input.language,
      priceCents: input.priceCents,
      coverUrl: input.coverUrl ?? null,
      fileUrl: input.fileUrl ?? null,
      status: input.status ?? "DRAFT",
    },
    include: { _count: { select: { purchases: true } } },
  });
  return toRecord(book);
}

export interface UpdateBookInput {
  title?: string;
  description?: string;
  genre?: string;
  language?: string;
  priceCents?: number;
  coverUrl?: string | null;
  fileUrl?: string | null;
  status?: BookStatus;
}

export async function updateBook(
  bookId: string,
  authorId: string,
  input: UpdateBookInput,
): Promise<BookRecord> {
  const existing = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!existing) throw new Error("Book not found.");

  const book = await prisma.book.update({
    where: { id: bookId },
    data: input,
    include: { _count: { select: { purchases: true } } },
  });
  return toRecord(book);
}

export async function deleteBook(bookId: string, authorId: string): Promise<void> {
  const existing = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!existing) throw new Error("Book not found.");
  await prisma.book.delete({ where: { id: bookId } });
}
