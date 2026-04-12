-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_readerId_bookId_key" ON "reviews"("readerId", "bookId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
