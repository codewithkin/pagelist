-- CreateTable
CREATE TABLE "intermediate_payments" (
    "id" TEXT NOT NULL,
    "readerId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "pollUrl" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intermediate_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "intermediate_payments" ADD CONSTRAINT "intermediate_payments_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intermediate_payments" ADD CONSTRAINT "intermediate_payments_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
