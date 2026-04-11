"use client";

import { useState, useCallback, use, useEffect } from "react";
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
import { useAuthorBook, useUpdateBook, useDeleteBook } from "@/hooks/use-books";
import { useUploadBook } from "@/hooks/use-upload";
import { toast } from "sonner";

const GENRES = [
  "Fiction", "Non-Fiction", "Self-Help", "Technology", "Science",
  "History", "Philosophy", "Poetry", "Memoir", "Business",
  "Fantasy", "Romance", "Mystery", "Thriller", "Other",
];

const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "German", "Other"];

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { data: book, isLoading } = useAuthorBook(id);
  const updateBook = useUpdateBook(id);
  const deleteBook = useDeleteBook();
  const uploadBook = useUploadBook();

  // Pre-populate with existing data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [price, setPrice] = useState("");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceCover, setReplaceCover] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Load book data when it arrives
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setDescription(book.description);
      setGenre(book.genre);
      setLanguage(book.language);
      setPrice(String(book.price));
    }
  }, [book]);

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
      let uploadedFileUrl = fileUrl;

      // Upload PDF if a new file was selected
      if (replaceFile) {
        const result = await uploadBook.mutateAsync(replaceFile);
        uploadedFileUrl = result.url;
        setFileUrl(result.url);
      }

      await updateBook.mutateAsync({
        title,
        description,
        genre,
        language,
        price: Number(price),
        ...(uploadedFileUrl && { fileUrl: uploadedFileUrl }),
      });
      toast.success("Book updated successfully.");
      router.push(ROUTES.AUTHOR_BOOKS);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteBook.mutateAsync(id);
      toast.success("Book deleted.");
      router.push(ROUTES.AUTHOR_BOOKS);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete book.");
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
        <PageHeader title="Edit Book" subtitle={isLoading ? "Loading..." : book ? `Editing "${book.title}"` : "Book not found"} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--color-brand-primary)]" />
        </div>
      )}

      {!isLoading && !book && (
        <div className="rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 text-center">
          <p className="text-sm text-[var(--color-brand-muted)]">Book not found.</p>
        </div>
      )}

      {!isLoading && book && (
        <>
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
              Current file: <span className="font-medium text-[var(--color-brand-primary)]">{book.fileUrl ? "Uploaded" : "None"}</span>
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
              disabled={isSaving || uploadBook.isPending || !title.trim()}
              className="bg-black text-white rounded-full hover:bg-neutral-800"
            >
              {(isSaving || uploadBook.isPending) && <Loader2 size={16} className="mr-1.5 animate-spin" />}
              {uploadBook.isPending ? "Uploading..." : "Save Changes"}
            </Button>
          </div>

          <Separator className="bg-[var(--color-brand-border)]" />

          {/* Danger Zone */}
          <DangerZone
            description="Permanently delete this book and all associated data. Readers who purchased it will lose access."
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
