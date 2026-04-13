"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "@pagelist/ui/lib/utils";
import { Button } from "@pagelist/ui/components/button";
import { ApiError, apiGet } from "@/lib/api-client";
import { ROUTES } from "@/lib/routes";

const STORAGE_KEY_PREFIX = "pagelist-reader-";

const FONT_SIZES = [
  { label: "S", value: 14 },
  { label: "M", value: 16 },
  { label: "L", value: 18 },
  { label: "XL", value: 20 },
  { label: "2XL", value: 22 },
];

// Fetch book content from API
function useBookContent(id: string) {
  const [data, setData] = useState<{ title: string; fileUrl: string | null; chapters: Array<{ title: string; content: string }> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const book = await apiGet<{ title: string; fileUrl: string | null }>(`/api/browse/${id}`);
        
        // If there's a PDF file URL, use it
        if (book.fileUrl) {
          setData({
            title: book.title,
            fileUrl: book.fileUrl,
            chapters: [],
          });
        } else {
          // Fallback if no PDF available
          setData({
            title: book.title,
            fileUrl: null,
            chapters: [
              { title: "No Content", content: "<p>This book doesn't have content available yet. Please upload a PDF file.</p>" },
            ],
          });
        }
        setError(null);
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.status === 404) {
            setError("Book not found");
          } else {
            setError(e.message || "Failed to load book");
          }
        } else {
          setError("Failed to load book");
        }
        setData(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  return { title: data?.title ?? "", fileUrl: data?.fileUrl ?? null, chapters: data?.chapters ?? [], isLoading, error };
}

export default function ReaderBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { title, fileUrl, chapters, isLoading, error } = useBookContent(id);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Restore reading position
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (typeof data.chapter === "number") setChapterIndex(data.chapter);
        if (typeof data.fontSize === "number") setFontSizeIndex(data.fontSize);
      } catch { /* ignore parsing errors */ }
    }
  }, [id]);

  // Save reading position (throttled)
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${id}`,
        JSON.stringify({ chapter: chapterIndex, fontSize: fontSizeIndex, scroll: window.scrollY }),
      );
    }, 2000);
    return () => clearInterval(timer);
  }, [id, chapterIndex, fontSizeIndex]);

  // Track scroll progress
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterIndex]);

  // Keyboard navigation
  const goToChapter = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev" && chapterIndex > 0) {
        setChapterIndex((i) => i - 1);
        window.scrollTo(0, 0);
      }
      if (direction === "next" && chapterIndex < chapters.length - 1) {
        setChapterIndex((i) => i + 1);
        window.scrollTo(0, 0);
      }
    },
    [chapterIndex, chapters.length],
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goToChapter("prev");
      if (e.key === "ArrowRight") goToChapter("next");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goToChapter]);

  const totalProgress = chapters.length > 0
    ? ((chapterIndex + scrollProgress / 100) / chapters.length) * 100
    : 0;

  const fontSize = FONT_SIZES[fontSizeIndex].value;
  const chapter = chapters[chapterIndex];

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-[var(--color-brand-surface)]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-[var(--color-brand-surface)] px-4 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-brand-primary)]">
          {error === "Book not found" ? "404" : "Error"}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-brand-muted)]">
          {error}
        </p>
        <Link
          href={ROUTES.READER_LIBRARY}
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  // If we have a PDF file URL, display it in fullscreen
  if (!isLoading && !error && fileUrl) {
    return (
      <div className="min-h-svh flex flex-col bg-[var(--color-brand-surface)]">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-brand-border)]">
          <div
            className="h-full bg-[var(--color-brand-primary)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[var(--color-brand-surface)]/95 backdrop-blur-sm border-b border-[var(--color-brand-border)]">
          <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4">
            <p
              className="truncate text-sm font-medium text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {title}
            </p>
            <Link
              href={ROUTES.READER_LIBRARY}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Library
            </Link>
          </div>
        </header>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${fileUrl}#toolbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--color-brand-surface)]">
      {/* Progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-[var(--color-brand-border)]">
        <div
          className="h-full bg-[var(--color-brand-primary)] transition-[width] duration-200"
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[var(--color-brand-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <p
            className="truncate text-sm font-medium text-[var(--color-brand-primary)]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {title}
          </p>
          <Link
            href={ROUTES.READER_LIBRARY}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Library
          </Link>
        </div>
      </header>

      {/* Font size controls */}
      <div className="mx-auto flex max-w-3xl items-center justify-end gap-2 px-4 pt-4">
        {FONT_SIZES.map((fs, i) => (
          <button
            key={fs.label}
            onClick={() => setFontSizeIndex(i)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
              i === fontSizeIndex
                ? "bg-black text-white"
                : "bg-[var(--color-brand-border)]/50 text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-border)]",
            )}
          >
            {fs.label}
          </button>
        ))}
      </div>

      {/* Chapter content */}
      <article className="mx-auto max-w-[65ch] px-4 py-8">
        <h2
          className="mb-8 text-2xl font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {chapter?.title}
        </h2>
        <div
          className="prose prose-neutral leading-relaxed text-[var(--color-brand-primary)]"
          style={{ fontSize: `${fontSize}px`, fontFamily: "var(--font-body), sans-serif" }}
          dangerouslySetInnerHTML={{ __html: chapter?.content ?? "" }}
        />
      </article>

      {/* Chapter navigation */}
      <div className="mx-auto flex max-w-[65ch] items-center justify-between px-4 pb-12">
        <Button
          variant="outline"
          disabled={chapterIndex === 0}
          onClick={() => goToChapter("prev")}
          className="rounded-full border-[var(--color-brand-border)]"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <span className="text-xs text-[var(--color-brand-muted)]">
          {chapterIndex + 1} / {chapters.length}
        </span>
        <Button
          variant="outline"
          disabled={chapterIndex >= chapters.length - 1}
          onClick={() => goToChapter("next")}
          className="rounded-full border-[var(--color-brand-border)]"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
