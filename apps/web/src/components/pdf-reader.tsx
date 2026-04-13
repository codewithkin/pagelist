"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker source - use CDN fallback for Turbopack compatibility
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFReaderProps {
  fileUrl: string;
  onPageChange?: (page: number, total: number) => void;
}

export function PDFReader({ fileUrl, onPageChange }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setPageWidth(Math.min(el.clientWidth - 32, 880));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onPageChange?.(1, numPages);
  }

  const goToPage = useCallback(
    (next: number) => {
      if (next < 1 || next > numPages) return;
      setPageNumber(next);
      onPageChange?.(next, numPages);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [numPages, onPageChange],
  );

  const effectiveWidth = pageWidth != null ? pageWidth * scale : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Scrollable PDF canvas */}
      <div
        ref={scrollRef}
        className="flex flex-1 justify-center overflow-y-auto bg-[#D8CEC2] px-4 py-8"
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-40 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
            </div>
          }
          error={
            <div className="py-12 text-center text-sm text-[var(--color-brand-muted)]">
              Unable to load the PDF. The file may be unavailable.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={effectiveWidth}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-[0_4px_28px_rgba(22,19,18,0.18)]"
          />
        </Document>
      </div>

      {/* Bottom navigation bar */}
      <div className="flex items-center justify-center gap-2 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] px-4 py-2.5">
        {/* Zoom out */}
        <button
          onClick={() => setScale((s) => +(Math.max(0.5, s - 0.15)).toFixed(2))}
          disabled={scale <= 0.5}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-brand-muted)] transition-colors hover:bg-[var(--color-brand-border)]/50 disabled:opacity-30"
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-10 text-center text-xs text-[var(--color-brand-muted)]">
          {Math.round(scale * 100)}%
        </span>
        {/* Zoom in */}
        <button
          onClick={() => setScale((s) => +(Math.min(2.5, s + 0.15)).toFixed(2))}
          disabled={scale >= 2.5}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-brand-muted)] transition-colors hover:bg-[var(--color-brand-border)]/50 disabled:opacity-30"
        >
          <ZoomIn size={14} />
        </button>

        {/* Divider */}
        <div className="mx-1 h-4 w-px bg-[var(--color-brand-border)]" />

        {/* Prev page */}
        <button
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-brand-muted)] transition-colors hover:bg-[var(--color-brand-border)]/50 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[4rem] text-center text-xs text-[var(--color-brand-muted)]">
          {pageNumber} / {numPages || "—"}
        </span>
        {/* Next page */}
        <button
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-brand-muted)] transition-colors hover:bg-[var(--color-brand-border)]/50 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
