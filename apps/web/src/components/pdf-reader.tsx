"use client";

import { useState } from "react";

interface PDFReaderProps {
  fileUrl: string;
  onPageChange?: (page: number, total: number) => void;
}

export function PDFReader({ fileUrl }: PDFReaderProps) {
  const [hasError, setHasError] = useState(false);

  if (!fileUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-[#D8CEC2]">
        <div className="text-center">
          <p className="text-sm text-[var(--color-brand-muted)]">No PDF file available</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-full items-center justify-center bg-[#D8CEC2]">
        <div className="text-center">
          <p className="text-sm text-[var(--color-brand-muted)]">Unable to load the PDF. The file may be unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`${fileUrl}#toolbar=1&view=FitH`}
      className="h-full w-full border-0"
      title="PDF Reader"
      onError={() => setHasError(true)}
      sandbox="allow-same-origin allow-scripts"
    />
  );
}
