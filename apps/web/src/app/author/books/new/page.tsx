"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, ArrowRight, Upload, FileText, X, Loader2, BookOpen } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { Textarea } from "@pagelist/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pagelist/ui/components/select";
import { Separator } from "@pagelist/ui/components/separator";
import { PageHeader } from "@/components/ui/page-header";
import { PriceTag } from "@/components/ui/price-tag";
import { ROUTES } from "@/lib/routes";
import { toast } from "sonner";
import { useCreateBook } from "@/hooks/use-books";

const GENRES = [
  "Fiction", "Non-Fiction", "Self-Help", "Technology", "Science",
  "History", "Philosophy", "Poetry", "Memoir", "Business",
  "Fantasy", "Romance", "Mystery", "Thriller", "Other",
];

const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "German", "Other"];

const STEPS = ["Details", "Upload", "Pricing", "Review"] as const;

interface FormData {
  title: string;
  description: string;
  genre: string;
  language: string;
  coverFile: File | null;
  pdfFile: File | null;
  price: string;
}

const STORAGE_KEY = "pagelist-new-book-draft";

function loadDraft(): Partial<FormData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Cannot persist File objects, so we only restore text fields
    return {
      title: parsed.title || "",
      description: parsed.description || "",
      genre: parsed.genre || "",
      language: parsed.language || "",
      price: parsed.price || "",
    };
  } catch {
    return {};
  }
}

function saveDraft(data: FormData) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title: data.title,
        description: data.description,
        genre: data.genre,
        language: data.language,
        price: data.price,
      }),
    );
  } catch {
    // ignore
  }
}

export default function NewBookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const createBook = useCreateBook();

  const [form, setForm] = useState<FormData>(() => ({
    title: "",
    description: "",
    genre: "",
    language: "English",
    coverFile: null,
    pdfFile: null,
    price: "",
    ...loadDraft(),
  }));

  // Persist text fields to localStorage on change
  useEffect(() => {
    saveDraft(form);
  }, [form]);

  function update(patch: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function canAdvance(): boolean {
    if (step === 0) return !!(form.title.trim() && form.genre && form.language);
    if (step === 1) return !!form.pdfFile;
    if (step === 2) return !!form.price && Number(form.price) >= 0;
    return true;
  }

  async function handleSubmit() {
    try {
      const priceCents = Math.round(Number(form.price) * 100);
      await createBook.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre,
        language: form.language,
        priceCents,
        coverUrl: null,
        fileUrl: null,
        status: "PUBLISHED",
      });
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Book created successfully.");
      router.push(ROUTES.AUTHOR_BOOKS);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create book.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Upload New Book" subtitle="Fill in the details step by step." />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? "bg-black text-white"
                  : i < step
                    ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] cursor-pointer"
                    : "bg-[var(--color-brand-border)] text-[var(--color-brand-muted)]"
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`hidden text-xs sm:inline ${
                i === step ? "font-medium text-[var(--color-brand-primary)]" : "text-[var(--color-brand-muted)]"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-6 bg-[var(--color-brand-border)] sm:w-10" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-brand-border)] p-6">
        {step === 0 && <StepDetails form={form} update={update} />}
        {step === 1 && <StepUpload form={form} update={update} />}
        {step === 2 && <StepPricing form={form} update={update} />}
        {step === 3 && <StepReview form={form} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="rounded-full border-[var(--color-brand-border)]"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className="bg-black text-white rounded-full hover:bg-neutral-800"
          >
            Next
            <ArrowRight size={16} className="ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createBook.isPending}
            className="bg-black text-white rounded-full hover:bg-neutral-800"
          >
            {createBook.isPending && <Loader2 size={16} className="mr-1.5 animate-spin" />}
            Publish Book
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Step 1: Details ─────────────────────────────────────────── */

function StepDetails({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g. The Art of Solitude"
          className="border-[var(--color-brand-border)]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="A short summary of your book…"
          rows={4}
          className="border-[var(--color-brand-border)] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Genre *</Label>
          <Select value={form.genre} onValueChange={(v) => update({ genre: v })}>
            <SelectTrigger className="border-[var(--color-brand-border)]">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Language *</Label>
          <Select value={form.language} onValueChange={(v) => update({ language: v })}>
            <SelectTrigger className="border-[var(--color-brand-border)]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Upload ──────────────────────────────────────────── */

function StepUpload({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  const onDropPdf = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) update({ pdfFile: accepted[0] });
    },
    [update],
  );

  const onDropCover = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) update({ coverFile: accepted[0] });
    },
    [update],
  );

  const pdfZone = useDropzone({
    onDrop: onDropPdf,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50 MB
  });

  const coverZone = useDropzone({
    onDrop: onDropCover,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5 MB
  });

  return (
    <div className="space-y-6">
      {/* PDF upload */}
      <div className="space-y-1.5">
        <Label>PDF File *</Label>
        {form.pdfFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
            <FileText size={20} className="text-[var(--color-brand-primary)]" />
            <span className="flex-1 truncate text-sm text-[var(--color-brand-primary)]">{form.pdfFile.name}</span>
            <span className="text-xs text-[var(--color-brand-muted)]">
              {(form.pdfFile.size / (1024 * 1024)).toFixed(1)} MB
            </span>
            <button type="button" onClick={() => update({ pdfFile: null })} className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-danger)]">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            {...pdfZone.getRootProps()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-8 text-center transition-colors hover:border-[var(--color-brand-primary)]/30"
          >
            <input {...pdfZone.getInputProps()} />
            <Upload size={24} className="text-[var(--color-brand-muted)]" />
            <p className="text-sm text-[var(--color-brand-muted)]">
              Drag & drop your PDF here, or <span className="font-medium text-[var(--color-brand-primary)]">browse</span>
            </p>
            <p className="text-xs text-[var(--color-brand-muted)]">Max 50 MB</p>
          </div>
        )}
      </div>

      <Separator className="bg-[var(--color-brand-border)]" />

      {/* Cover upload */}
      <div className="space-y-1.5">
        <Label>Cover Image (optional)</Label>
        {form.coverFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(form.coverFile)}
              alt="Cover preview"
              className="h-16 w-12 rounded-md object-cover"
            />
            <span className="flex-1 truncate text-sm text-[var(--color-brand-primary)]">{form.coverFile.name}</span>
            <button type="button" onClick={() => update({ coverFile: null })} className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-danger)]">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            {...coverZone.getRootProps()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 text-center transition-colors hover:border-[var(--color-brand-primary)]/30"
          >
            <input {...coverZone.getInputProps()} />
            <Upload size={20} className="text-[var(--color-brand-muted)]" />
            <p className="text-sm text-[var(--color-brand-muted)]">
              Upload a cover image (PNG, JPG, WebP — max 5 MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 3: Pricing ─────────────────────────────────────────── */

function StepPricing({ form, update }: { form: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="price">Price (USD) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-brand-muted)]">$</span>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update({ price: e.target.value })}
            placeholder="0.00"
            className="border-[var(--color-brand-border)] pl-7"
          />
        </div>
        <p className="text-xs text-[var(--color-brand-muted)]">
          Set to 0 for a free book. PageList takes a 20% platform fee on paid sales.
        </p>
      </div>

      {Number(form.price) > 0 && (
        <div className="rounded-lg bg-[var(--color-brand-surface)] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-brand-muted)]">Reader pays</span>
            <PriceTag amount={Number(form.price)} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[var(--color-brand-muted)]">Platform fee (20%)</span>
            <span className="text-[var(--color-brand-muted)]">−${(Number(form.price) * 0.2).toFixed(2)}</span>
          </div>
          <Separator className="my-2 bg-[var(--color-brand-border)]" />
          <div className="flex items-center justify-between font-medium">
            <span className="text-[var(--color-brand-primary)]">You earn</span>
            <PriceTag amount={Number(form.price) * 0.8} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 4: Review ──────────────────────────────────────────── */

function StepReview({ form }: { form: FormData }) {
  const rows: [string, string][] = [
    ["Title", form.title],
    ["Description", form.description || "—"],
    ["Genre", form.genre],
    ["Language", form.language],
    ["PDF File", form.pdfFile?.name ?? "—"],
    ["Cover Image", form.coverFile?.name ?? "None"],
    ["Price", form.price ? `$${Number(form.price).toFixed(2)}` : "Free"],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10">
          <BookOpen size={20} className="text-[var(--color-brand-primary)]" />
        </div>
        <div>
          <h3
            className="font-semibold text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Review your book
          </h3>
          <p className="text-xs text-[var(--color-brand-muted)]">Confirm the details before publishing.</p>
        </div>
      </div>

      <div className="divide-y divide-[var(--color-brand-border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between py-2.5 text-sm">
            <span className="text-[var(--color-brand-muted)]">{label}</span>
            <span className="max-w-[60%] text-right font-medium text-[var(--color-brand-primary)]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
