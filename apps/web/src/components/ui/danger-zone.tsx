"use client";

import { useState } from "react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@pagelist/ui/components/alert-dialog";

interface DangerZoneProps {
  description: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DangerZone({ description, onConfirm, isPending }: DangerZoneProps) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="rounded-xl border border-[var(--color-brand-border)] p-6">
      <h3
        className="text-lg font-semibold text-[var(--color-brand-danger)]"
        style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
      >
        Danger Zone
      </h3>
      <p className="mt-1 text-sm text-[var(--color-brand-muted)]">{description}</p>
      <div className="mt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-full border-[var(--color-brand-danger)] text-[var(--color-brand-danger)] hover:bg-[var(--color-brand-danger)]/10">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Type <strong>DELETE</strong> below to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirmText !== "DELETE" || isPending}
                onClick={onConfirm}
                className="bg-[var(--color-brand-danger)] text-white hover:bg-[var(--color-brand-danger)]/90"
              >
                {isPending ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
