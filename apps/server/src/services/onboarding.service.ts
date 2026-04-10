import prisma from "@pagelist/db";

export const READER_GENRES = [
  "Fiction",
  "Mystery & Thriller",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Historical Fiction",
  "Non-fiction",
  "Self-improvement",
  "Biographies",
  "Essays",
  "Poetry",
  "Memoirs",
] as const;

export const WRITER_GENRES = [
  "Fiction",
  "Mystery & Thriller",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Historical Fiction",
  "Non-fiction",
  "Self-improvement",
  "Poetry",
  "Essays",
  "Memoirs",
  "Children's",
] as const;

export type ReaderGenre = (typeof READER_GENRES)[number];
export type WriterGenre = (typeof WRITER_GENRES)[number];

export async function completeOnboarding(
  userId: string,
  role: "READER" | "WRITER",
  genres: string[],
): Promise<void> {
  const genresJson = JSON.stringify(genres);

  const fieldToUpdate =
    role === "READER"
      ? { readerGenres: genresJson }
      : { writerGenres: genresJson };

  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      ...fieldToUpdate,
    },
  });
}

export async function getOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingCompleted: true,
      role: true,
      readerGenres: true,
      writerGenres: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    completed: user.onboardingCompleted,
    role: user.role,
    selectedGenres:
      user.role === "READER"
        ? (user.readerGenres && JSON.parse(user.readerGenres))
        : (user.writerGenres && JSON.parse(user.writerGenres)) || [],
  };
}
