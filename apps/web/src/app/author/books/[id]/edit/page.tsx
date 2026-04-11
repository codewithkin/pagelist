"use client";

import { useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, Upload, FileText, X, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
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
import { DangerZone } from "@/components/ui/danger-zone";
import { ROUTES } from "@/lib/routes";
import type { Book } from "@/types";
import { toast } from "sonner";

const GENRES = [
  "Fiction", "Non-Fiction", "Self-Help", "Technology", "Science",
  "History", "Philosophy", "Poetry", "Memoir", "Business",
  "Fantasy", "Romance", "Mystery", "Thriller", "Other",
];

const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "German", "Other"];

// TODO: replace with real API fetch
const MOCK_BOOK: Book = {
  id: "b1",
  title: "The Art of Solitude",
  author: "You",
  description: "A meditation on spending time alone and why it matters in a hyper-connected world.",
  genre: "Self-Help",
  language: "English",
  price: 14.99,
  coverUrl: null,
  fileUrl: "/files/b1.pdf",
  status: "PUBLISHED",
  totalSales: 142,
  createdAt: "2024-09-10T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
};

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate with existing data
  const [title, setTitle] = useState(MOCK_BOOK.title);
  const [description, setDescription] = useState(MOCK_BOOK.description);
  const [genre, setGenre] = useState(MOCK_BOOK.genre);
  const [language, setLanguage] = useState(MOCK_BOOK.language);
  const [price, setPrice] = useState(String(MOCK_BOOK.price));
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceCover, setReplaceCover] = useState<File | null>(null);

  const pdfZone = useDropzone({
    onDrop: useCallback((accepted: File[]) => {
      if (accepted[0]) setReplaceFile(accepted[0]);
    }, []),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const coverZone = useDropzone({
    onDrop: useCallback((accepted: File[]) => {
      if (accepted[0]) setReplaceCover(accepted[0]);
    }, []),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: API call
      toast.success("Book updated successfully.");
      router.push(ROUTES.AUTHOR_BOOKS);
    } catch {
      toast.error("Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href={ROUTES.AUTHOR_BOOKS}>
            <ArrowLeft size={16} />
          </Link>
        </Button>
        <PageHeader title="Edit Book" subtitle={`Editing "${MOCK_BOOK.title}"`} />
      </div>

      {/* Details */}
      <section className="space-y-5 rounded-xl border border-[var(--color-brand-border)] p-6">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Details
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="border-[var(--color-brand-border)]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="border-[var(--color-brand-border)] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="border-[var(--color-brand-border)]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="border-[var(--color-brand-border)]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-brand-muted)]">$</span>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="border-[var(--color-brand-border)] pl-7" />
          </div>
        </div>
      </section>

      {/* Replace PDF */}
      <section className="space-y-4 rounded-xl border border-[var(--color-brand-border)] p-6">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          PDF File
        </h2>
        <p className="text-sm text-[var(--color-brand-muted)]">
          Current file: <span className="font-medium text-[var(--color-brand-primary)]">{MOCK_BOOK.fileUrl ? "Uploaded" : "None"}</span>
        </p>

        {replaceFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
            <FileText size={20} className="text-[var(--color-brand-primary)]" />
            <span className="flex-1 truncate text-sm">{replaceFile.name}</span>
            <span className="text-xs text-[var(--color-brand-muted)]">{(replaceFile.size / (1024 * 1024)).toFixed(1)} MB</span>
            <button type="button" onClick={() => setReplaceFile(null)} className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-danger)]">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            {...pdfZone.getRootProps()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 text-center transition-colors hover:border-[var(--color-brand-primary)]/30"
          >
            <input {...pdfZone.getInputProps()} />
            <RefreshCw size={20} className="text-[var(--color-brand-muted)]" />
            <p className="text-sm text-[var(--color-brand-muted)]">
              Drop a new PDF to replace the current file
            </p>
          </div>
        )}
      </section>

      {/* Replace Cover */}
      <section className="space-y-4 rounded-xl border border-[var(--color-brand-border)] p-6">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Cover Image
        </h2>

        {replaceCover ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(replaceCover)} alt="Cover" className="h-16 w-12 rounded-md object-cover" />
            <span className="flex-1 truncate text-sm">{replaceCover.name}</span>
            <button type="button" onClick={() => setReplaceCover(null)} className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-danger)]">
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
            <p className="text-sm text-[var(--color-brand-muted)]">Upload a new cover image</p>
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="bg-black text-white rounded-full hover:bg-neutral-800"
        >
          {isSaving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Separator className="bg-[var(--color-brand-border)]" />

      {/* Danger Zone */}
      <DangerZone
        description="Permanently delete this book and all associated data. Readers who purchased it will lose access."
        onConfirm={() => {
          // TODO: API call
          toast.error("Delete not yet implemented.");
        }}
      />
    </div>
  );
}
