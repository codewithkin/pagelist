export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  coverUrl: string | null;
  fileUrl: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  totalSales: number;
  createdAt: string;
  updatedAt: string;
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
