import prisma from "@pagelist/db";
import { env } from "@pagelist/env/server";
import { sendPurchaseReceiptEmail } from "./email.service";
import {
  createPaynowClient,
  isPaidStatus,
  pollPaynowTransaction,
  sendBookPayment,
  type PaynowInitResponse,
  type PaynowPollResponse,
} from "@pagelist/payments";

export class PaymentError extends Error {
  constructor(
    message: string,
    public status: 400 | 401 | 403 | 404 | 409 | 422 | 500,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export interface PaymentInitiationResult {
  intermediatePaymentId: string;
  redirectUrl: string;
}

export interface PaymentCompletionResult {
  purchaseId: string;
  bookId: string;
  bookTitle: string;
  amount: number;
}

function getPaynowClient(intermediatePaymentId: string) {
  if (!env.PAYNOW_INTEGRATION_ID || !env.PAYNOW_INTEGRATION_KEY) {
    throw new PaymentError("Payment gateway is not configured.", 500);
  }

  const successUrl = `${env.FRONTEND_URL}/payments/success?intermediatePayment=${intermediatePaymentId}`;

  return createPaynowClient({
    integrationId: env.PAYNOW_INTEGRATION_ID,
    integrationKey: env.PAYNOW_INTEGRATION_KEY,
    resultUrl: successUrl,
    returnUrl: successUrl,
  });
}

export async function initiatePayment(readerId: string, bookId: string): Promise<PaymentInitiationResult> {
  const existingPurchase = await prisma.purchase.findUnique({
    where: { readerId_bookId: { readerId, bookId } },
  });

  if (existingPurchase) {
    throw new PaymentError("You already own this book.", 409);
  }

  const book = await prisma.book.findFirst({
    where: { id: bookId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      priceCents: true,
      discountPriceCents: true,
    },
  });

  if (!book) {
    throw new PaymentError("Book not found.", 404);
  }

  const amountCents = book.discountPriceCents ?? book.priceCents;
  if (amountCents <= 0) {
    throw new PaymentError("This book is free and does not require payment.", 422);
  }

  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

  const pending = await prisma.intermediatePayment.findFirst({
    where: {
      readerId,
      bookId,
      paid: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (pending) {
    throw new PaymentError(
      "A payment for this book is already in progress. Complete it first or wait for it to expire.",
      409,
    );
  }

  const intermediatePayment = await prisma.intermediatePayment.create({
    data: {
      readerId,
      bookId,
      bookTitle: book.title,
      amountCents,
      expiresAt: oneHourFromNow,
    },
  });

  const paynow = getPaynowClient(intermediatePayment.id);
  const initResponse = await sendBookPayment(paynow, {
    reference: `book-${book.id}-${intermediatePayment.id}`,
    title: book.title,
    amount: amountCents / 100,
  }) as PaynowInitResponse | null;

  if (!initResponse || !initResponse.success || !initResponse.redirectUrl || !initResponse.pollUrl) {
    await prisma.intermediatePayment.delete({ where: { id: intermediatePayment.id } }).catch(() => undefined);
    throw new PaymentError(initResponse?.error || "Could not initialize payment.", 500);
  }

  await prisma.intermediatePayment.update({
    where: { id: intermediatePayment.id },
    data: { pollUrl: initResponse.pollUrl },
  });

  return {
    intermediatePaymentId: intermediatePayment.id,
    redirectUrl: initResponse.redirectUrl,
  };
}

export async function completePayment(
  intermediatePaymentId: string,
  requestingUserId: string,
): Promise<PaymentCompletionResult> {
  const intermediatePayment = await prisma.intermediatePayment.findUnique({
    where: { id: intermediatePaymentId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
        },
      },
      reader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!intermediatePayment) {
    throw new PaymentError("Payment not found.", 404);
  }

  if (intermediatePayment.readerId !== requestingUserId) {
    throw new PaymentError("This payment belongs to a different account.", 403);
  }

  if (intermediatePayment.expiresAt < new Date()) {
    throw new PaymentError("This payment link has expired.", 409);
  }

  const alreadyOwned = await prisma.purchase.findUnique({
    where: {
      readerId_bookId: {
        readerId: intermediatePayment.readerId,
        bookId: intermediatePayment.bookId,
      },
    },
  });

  if (alreadyOwned) {
    if (!intermediatePayment.paid) {
      await prisma.intermediatePayment.update({
        where: { id: intermediatePayment.id },
        data: { paid: true },
      });
    }

    throw new PaymentError("You already own this book.", 409);
  }

  if (intermediatePayment.paid) {
    throw new PaymentError("This payment has already been completed.", 409);
  }

  if (!intermediatePayment.pollUrl) {
    throw new PaymentError("Payment transaction is missing poll information.", 500);
  }

  const paynow = getPaynowClient(intermediatePayment.id);
  const pollResponse = await pollPaynowTransaction(
    paynow,
    intermediatePayment.pollUrl,
  ) as PaynowPollResponse | null;
  const status = pollResponse?.status?.toString().trim();

  if (!isPaidStatus(status)) {
    throw new PaymentError(
      `Payment was not completed on Paynow${status ? ` (status: ${status})` : ""}.`,
      409,
    );
  }

  const purchase = await prisma.$transaction(async (tx) => {
    const createdPurchase = await tx.purchase.create({
      data: {
        readerId: intermediatePayment.readerId,
        bookId: intermediatePayment.bookId,
        amountPaid: intermediatePayment.amountCents,
      },
    });

    await tx.intermediatePayment.update({
      where: { id: intermediatePayment.id },
      data: { paid: true },
    });

    return createdPurchase;
  });

  sendPurchaseReceiptEmail(
    intermediatePayment.reader.email,
    intermediatePayment.reader.name ?? "Reader",
    intermediatePayment.book.title,
    purchase.amountPaid / 100,
    purchase.id,
    intermediatePayment.book.id,
    intermediatePayment.book.coverUrl,
  ).catch((error) => {
    console.error(
      "[Email Error] Failed to send purchase receipt email:",
      JSON.stringify({
        to: intermediatePayment.reader.email,
        subject: `Your receipt for "${intermediatePayment.book.title}" — Pagelist`,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  });

  return {
    purchaseId: purchase.id,
    bookId: intermediatePayment.book.id,
    bookTitle: intermediatePayment.book.title,
    amount: purchase.amountPaid / 100,
  };
}

export async function getPaymentStatus(intermediatePaymentId: string, requestingUserId: string) {
  const intermediatePayment = await prisma.intermediatePayment.findUnique({
    where: { id: intermediatePaymentId },
    select: {
      id: true,
      paid: true,
      readerId: true,
      bookId: true,
      expiresAt: true,
      bookTitle: true,
      amountCents: true,
    },
  });

  if (!intermediatePayment) {
    return {
      exists: false,
      paid: false,
      alreadyOwned: false,
      userMismatch: false,
      expired: false,
      bookTitle: null,
      amount: null,
    };
  }

  const alreadyOwned =
    (await prisma.purchase.findUnique({
      where: {
        readerId_bookId: {
          readerId: intermediatePayment.readerId,
          bookId: intermediatePayment.bookId,
        },
      },
      select: { id: true },
    })) !== null;

  return {
    exists: true,
    paid: intermediatePayment.paid,
    alreadyOwned,
    userMismatch: intermediatePayment.readerId !== requestingUserId,
    expired: intermediatePayment.expiresAt < new Date(),
    bookTitle: intermediatePayment.bookTitle,
    amount: intermediatePayment.amountCents / 100,
  };
}
