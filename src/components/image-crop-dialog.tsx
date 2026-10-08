"use client";

import * as React from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cropImage } from "@/lib/image";

export interface CropResult {
  blob: Blob;
  ext: string;
}

interface ImageCropDialogProps {
  open: boolean;
  src: string | null;
  file: File | null;
  title?: string;
  description?: string;
  aspect?: number;
  cropShape?: "rect" | "round";
  maxEdge?: number;
  onCancel: () => void;
  onConfirm: (result: CropResult) => void | Promise<void>;
}

interface CropStageProps {
  src: string | null;
  file: File | null;
  aspect: number;
  cropShape?: "rect" | "round";
  maxEdge: number;
  onCancel: () => void;
  onConfirm: (result: CropResult) => void | Promise<void>;
}

function CropStage({ src, file, aspect, cropShape, maxEdge, onCancel, onConfirm }: CropStageProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [area, setArea] = React.useState<Area | null>(null);
  const [busy, setBusy] = React.useState(false);

  const apply = async () => {
    if (!file || !area) return;
    setBusy(true);
    try {
      const result = await cropImage(file, area, { maxEdge });
      await onConfirm(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted sm:h-80">
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, cropped) => setArea(cropped)}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[color:var(--yaaq-gold)]"
          aria-label="Zoom"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="gold" onClick={apply} disabled={busy || !area} isLoading={busy}>
          Use this photo
        </Button>
      </DialogFooter>
    </>
  );
}

export function ImageCropDialog({
  open,
  src,
  file,
  title = "Adjust your photo",
  description = "Drag to reposition and use zoom so the face or important part fits the frame.",
  aspect = 1,
  cropShape = "rect",
  maxEdge = 1024,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <CropStage
          key={src ?? "no-image"}
          src={src}
          file={file}
          aspect={aspect}
          cropShape={cropShape}
          maxEdge={maxEdge}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
