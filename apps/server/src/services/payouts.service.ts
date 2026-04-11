import prisma from "@pagelist/db";
import type { PayoutMethodType } from "@pagelist/db/prisma/generated/enums";

export interface PayoutRecord {
  id: string;
  amount: number;
  destination: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  initiatedAt: string;
}

export interface PayoutMethodRecord {
  type: "ECOCASH" | "BANK_TRANSFER";
  phoneNumber?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
}

export interface PayoutSummary {
  availableBalance: number;
  totalWithdrawn: number;
  totalPending: number;
  payouts: PayoutRecord[];
  payoutMethod: PayoutMethodRecord | null;
}

const PLATFORM_FEE_RATE = 0.3;

export async function getPayoutSummary(authorId: string): Promise<PayoutSummary> {
  const [purchasesForBalance, payouts, payoutMethod] = await Promise.all([
    prisma.purchase.findMany({
      where: { book: { authorId } },
      select: { amountPaid: true },
    }),
    prisma.payout.findMany({
      where: { authorId },
      orderBy: { initiatedAt: "desc" },
    }),
    prisma.payoutMethod.findUnique({ where: { userId: authorId } }),
  ]);

  const totalEarned = purchasesForBalance.reduce(
    (sum, p) => sum + (p.amountPaid / 100) * (1 - PLATFORM_FEE_RATE),
    0,
  );

  const totalWithdrawnCents = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amountCents, 0);
  const totalPendingCents = payouts
    .filter((p) => p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const totalWithdrawn = totalWithdrawnCents / 100;
  const totalPending = totalPendingCents / 100;
  const availableBalance = Math.max(0, totalEarned - totalWithdrawn - totalPending);

  const payoutRecords: PayoutRecord[] = payouts.map((p) => ({
    id: p.id,
    amount: p.amountCents / 100,
    destination: p.destination,
    status: p.status as "PROCESSING" | "COMPLETED" | "FAILED",
    initiatedAt: p.initiatedAt.toISOString(),
  }));

  return {
    availableBalance: Math.round(availableBalance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    totalPending: Math.round(totalPending * 100) / 100,
    payouts: payoutRecords,
    payoutMethod: payoutMethod
      ? {
          type: payoutMethod.type as "ECOCASH" | "BANK_TRANSFER",
          phoneNumber: payoutMethod.phoneNumber,
          bankName: payoutMethod.bankName,
          accountName: payoutMethod.accountName,
          accountNumber: payoutMethod.accountNumber,
        }
      : null,
  };
}

export async function savePayoutMethod(
  authorId: string,
  input: PayoutMethodRecord,
): Promise<void> {
  await prisma.payoutMethod.upsert({
    where: { userId: authorId },
    create: {
      userId: authorId,
      type: input.type as PayoutMethodType,
      phoneNumber: input.phoneNumber ?? null,
      bankName: input.bankName ?? null,
      accountName: input.accountName ?? null,
      accountNumber: input.accountNumber ?? null,
    },
    update: {
      type: input.type as PayoutMethodType,
      phoneNumber: input.phoneNumber ?? null,
      bankName: input.bankName ?? null,
      accountName: input.accountName ?? null,
      accountNumber: input.accountNumber ?? null,
    },
  });
}

export async function requestPayout(authorId: string, amountCents: number): Promise<PayoutRecord> {
  const summary = await getPayoutSummary(authorId);
  const requestedAmount = amountCents / 100;

  if (requestedAmount > summary.availableBalance) {
    throw new Error("Requested amount exceeds available balance.");
  }

  const method = await prisma.payoutMethod.findUnique({ where: { userId: authorId } });
  if (!method) throw new Error("Please save a payout method first.");

  let destination = "";
  if (method.type === "ECOCASH") {
    destination = `EcoCash •••${(method.phoneNumber ?? "0000").slice(-4)}`;
  } else {
    destination = `${method.bankName ?? "Bank"} •••${(method.accountNumber ?? "0000").slice(-4)}`;
  }

  const payout = await prisma.payout.create({
    data: {
      authorId,
      amountCents,
      destination,
      status: "PROCESSING",
    },
  });

  return {
    id: payout.id,
    amount: payout.amountCents / 100,
    destination: payout.destination,
    status: "PROCESSING",
    initiatedAt: payout.initiatedAt.toISOString(),
  };
}
