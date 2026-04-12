export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  discountPrice: number | null;
  coverUrl: string | null;
  fileUrl: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  totalSales: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
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

export interface Order {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string | null;
  amount: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  bookId: string;
  bookTitle: string;
  buyerLabel: string;
  price: number;
  authorCut: number;
  createdAt: string;
}

export interface AuthorSummary {
  totalEarnings: number;
  monthEarnings: number;
  totalBooks: number;
  totalSold: number;
  recentSales: Sale[];
}

export interface EarningsSummary {
  totalEarnings: number;
  totalSales: number;
  averageSaleValue: number;
  transactions: Sale[];
}

export interface Payout {
  id: string;
  amount: number;
  destination: string;
  initiatedAt: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
}

export interface PayoutMethod {
  type: "ECOCASH" | "BANK_TRANSFER";
  phoneNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

/* ── Public page types ─────────────────────────────────────────── */

export interface BookDetail {
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

export interface BookSummary {
  id: string;
  title: string;
  coverUrl: string | null;
  price: number;
  discountPrice: number | null;
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  bookCount: number;
  joinedAt: string;
}

export interface CatalogueResult {
  books: Book[];
  total: number;
  hasMore: boolean;
}
