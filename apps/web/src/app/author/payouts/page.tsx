"use client";

import { useState } from "react";
import { Loader2, Phone, Building2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { Badge } from "@pagelist/ui/components/badge";
import { Separator } from "@pagelist/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pagelist/ui/components/table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { PriceTag } from "@/components/ui/price-tag";
import { EmptyState } from "@/components/ui/empty-state";
import type { Payout, PayoutMethod } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

const MOCK_PAYOUTS: Payout[] = [
  { id: "p1", amount: 250.0, destination: "EcoCash •••1234", initiatedAt: "2025-06-01T10:00:00Z", status: "COMPLETED" },
  { id: "p2", amount: 180.0, destination: "EcoCash •••1234", initiatedAt: "2025-05-15T08:30:00Z", status: "COMPLETED" },
  { id: "p3", amount: 300.0, destination: "CBZ Bank •••5678", initiatedAt: "2025-06-10T14:00:00Z", status: "PROCESSING" },
];

const STATUS_STYLES: Record<Payout["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PROCESSING: { label: "Processing", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export default function AuthorPayoutsPage() {
  const [methodType, setMethodType] = useState<PayoutMethod["type"]>("ECOCASH");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const availableBalance = 412.5; // TODO: from API
  const payouts = MOCK_PAYOUTS;

  async function handleSaveMethod() {
    setIsSaving(true);
    try {
      // TODO: API call
      toast.success("Payout method saved.");
    } catch {
      toast.error("Failed to save payout method.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestPayout() {
    // TODO: API call
    toast.success("Payout requested. You'll receive it within 24–48 hours.");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Payouts" subtitle="Manage your payout method and request withdrawals.">
        <Button
          onClick={handleRequestPayout}
          disabled={availableBalance <= 0}
          className="bg-black text-white rounded-full hover:bg-neutral-800"
        >
          Request Payout
        </Button>
      </PageHeader>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Available Balance"
          value={`$${availableBalance.toFixed(2)}`}
        />
        <StatCard
          label="Total Withdrawn"
          value={`$${payouts.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`}
        />
        <StatCard
          label="Pending"
          value={`$${payouts.filter((p) => p.status === "PROCESSING").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`}
        />
      </div>

      {/* Payout method */}
      <section className="space-y-5 rounded-xl border border-[var(--color-brand-border)] p-6">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Payout Method
        </h2>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMethodType("ECOCASH")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              methodType === "ECOCASH"
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-surface)] text-[var(--color-brand-primary)]"
                : "border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/30"
            }`}
          >
            <Phone size={16} />
            EcoCash
          </button>
          <button
            type="button"
            onClick={() => setMethodType("BANK_TRANSFER")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              methodType === "BANK_TRANSFER"
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-surface)] text-[var(--color-brand-primary)]"
                : "border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/30"
            }`}
          >
            <Building2 size={16} />
            Bank Transfer
          </button>
        </div>

        {methodType === "ECOCASH" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">EcoCash Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0771234567"
                className="border-[var(--color-brand-border)]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. CBZ Bank" className="border-[var(--color-brand-border)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Full name on account" className="border-[var(--color-brand-border)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="border-[var(--color-brand-border)]" />
            </div>
          </div>
        )}

        <Button
          onClick={handleSaveMethod}
          disabled={isSaving || (methodType === "ECOCASH" ? !phone : !bankName || !accountName || !accountNumber)}
          className="bg-black text-white rounded-full hover:bg-neutral-800"
        >
          {isSaving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
          Save Method
        </Button>
      </section>

      <Separator className="bg-[var(--color-brand-border)]" />

      {/* Payout history */}
      <section className="space-y-4">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Payout History
        </h2>

        {payouts.length === 0 ? (
          <EmptyState title="No payouts yet" description="Request your first payout when you have available earnings." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--color-brand-border)]">
                  <TableHead className="text-[var(--color-brand-muted)]">Date</TableHead>
                  <TableHead className="text-[var(--color-brand-muted)]">Destination</TableHead>
                  <TableHead className="text-right text-[var(--color-brand-muted)]">Amount</TableHead>
                  <TableHead className="text-right text-[var(--color-brand-muted)]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => {
                  const style = STATUS_STYLES[payout.status];
                  return (
                    <TableRow key={payout.id} className="border-[var(--color-brand-border)]">
                      <TableCell className="text-sm text-[var(--color-brand-muted)]">
                        {format(new Date(payout.initiatedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-[var(--color-brand-primary)]">{payout.destination}</TableCell>
                      <TableCell className="text-right"><PriceTag amount={payout.amount} /></TableCell>
                      <TableCell className="text-right">
                        <Badge variant={style.variant} className="rounded-full text-xs px-2.5 py-0.5">{style.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
