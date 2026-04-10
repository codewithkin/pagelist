import prisma from "@pagelist/db";

export interface LibraryStats {
  stats: {
    totalOwned: number;
    currentlyReading: number;
    completed: number;
    wishlist: number;
  };
  currentReads: {
    id: string;
    title: string;
    author: string;
    progress: number;
    coverColor: string;
  }[];
  recentlyAdded: {
    id: string;
    title: string;
    author: string;
    addedAt: string;
  }[];
  monthlyActivity: {
    month: string;
    books: number;
  }[];
}

const COVER_COLORS = ["#D9A826", "#8B7355", "#4A6741", "#6B5B8A", "#A65D57", "#3D7A8A"];

const READER_BOOKS = [
  { title: "The Cabinet of Small Secrets", author: "E. Alderton" },
  { title: "Still Waters, Moving Light", author: "P. Vasquez" },
  { title: "A Cartography of Grief", author: "T. Nakamura" },
  { title: "The Hours Between Clocks", author: "S. Okonkwo" },
  { title: "Margin Notes", author: "R. Delacroix" },
  { title: "The Quiet Encyclopaedia", author: "J. Hawthorn" },
  { title: "Letters from Nowhere", author: "A. Sundaram" },
  { title: "Pale Fire's Shadow", author: "C. Whitmore" },
  { title: "The Annotated Evening", author: "L. Ferrara" },
  { title: "Between Two Silences", author: "M. Osei" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function seed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export async function getLibraryStats(userId: string): Promise<LibraryStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  const s = seed(userId);

  const totalOwned = 10 + (s % 40);
  const completed = Math.floor(totalOwned * 0.7);
  const currentlyReading = 1 + (s % 3);
  const wishlist = 3 + (s % 15);

  const currentReads = Array.from({ length: currentlyReading }, (_, i) => {
    const si = seed(userId + `read${i}`);
    const book = READER_BOOKS[(s + i) % READER_BOOKS.length]!;
    return {
      id: `read-${i + 1}`,
      title: book.title,
      author: book.author,
      progress: 10 + (si % 85),
      coverColor: COVER_COLORS[(si) % COVER_COLORS.length]!,
    };
  });

  const recentlyAdded = Array.from({ length: 6 }, (_, i) => {
    const si = seed(userId + `added${i}`);
    const book = READER_BOOKS[(s + i + currentlyReading) % READER_BOOKS.length]!;
    return {
      id: `added-${i + 1}`,
      title: book.title,
      author: book.author,
      addedAt: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  const now = new Date();
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
    const si = seed(userId + `activity${i}`);
    return {
      month: MONTHS[monthIndex]!,
      books: Math.max(0, (si % 6) + (i > 8 ? 1 : 0)),
    };
  });

  return {
    stats: { totalOwned, currentlyReading, completed, wishlist },
    currentReads,
    recentlyAdded,
    monthlyActivity,
  };
}
