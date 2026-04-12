"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Button } from "@pagelist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@pagelist/ui/components/dialog";

interface CoverCropModalProps {
  file: File;
  onDone: (cropped: File) => void;
  onCancel: () => void;
}

/** 2∶3 portrait ratio — matches the aspect-[2/3] used on all book cards */
const ASPECT = 2 / 3;

export function CoverCropModal({ file, onDone, onCancel }: CoverCropModalProps) {
  const [imgSrc] = useState(() => URL.createObjectURL(file));
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, ASPECT, width, height),
      width,
      height,
    );
    setCrop(initial);
  }, []);

  function handleApply() {
    if (!imgRef.current || !completedCrop) return;

    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(completedCrop.width * scaleX);
    canvas.height = Math.round(completedCrop.height * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
        onDone(croppedFile);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop cover image</DialogTitle>
          <p className="text-sm text-[var(--color-brand-muted)]">
            Drag to position the crop area. The 2∶3 ratio matches how covers appear across the
            catalogue.
          </p>
        </DialogHeader>

        <div className="flex max-h-[58vh] justify-center overflow-auto py-2">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            aspect={ASPECT}
            minWidth={80}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[54vh] w-auto"
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-full border-[var(--color-brand-border)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!completedCrop}
            className="rounded-full bg-black text-white hover:bg-neutral-800"
          >
            Apply crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
