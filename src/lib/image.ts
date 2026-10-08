export interface CompressImageResult {
  blob: Blob;
  ext: string;
  width: number;
  height: number;
  compressed: boolean;
}

export function extFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : "jpg";
}

export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to encode image"));
      }
    }, type, quality);
  });
}

export async function compressImage(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<CompressImageResult> {
  const maxEdge = options?.maxEdge ?? 1024;
  const quality = options?.quality ?? 0.8;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported in this browser");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    let blob: Blob;
    let ext: string;

    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp.type === "image/webp") {
      blob = webp;
      ext = "webp";
    } else if (file.type === "image/png") {
      blob = file;
      ext = extFromName(file.name);
    } else {
      blob = await canvasToBlob(canvas, "image/jpeg", Math.min(quality + 0.05, 0.85));
      ext = "jpg";
    }

    if (blob.size >= file.size) {
      return {
        blob: file,
        ext: extFromName(file.name),
        width: bitmap.width,
        height: bitmap.height,
        compressed: false,
      };
    }

    return { blob, ext, width, height, compressed: true };
  } finally {
    bitmap.close();
  }
}

export async function cropImage(
  file: Blob,
  area: { x: number; y: number; width: number; height: number },
  options?: { maxEdge?: number; quality?: number }
): Promise<{ blob: Blob; ext: string }> {
  const maxEdge = options?.maxEdge ?? 1024;
  const quality = options?.quality ?? 0.8;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(area.width, area.height));
    const width = Math.max(1, Math.round(area.width * scale));
    const height = Math.max(1, Math.round(area.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported in this browser");
    }
    ctx.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp.type === "image/webp") {
      return { blob: webp, ext: "webp" };
    }
    const jpeg = await canvasToBlob(canvas, "image/jpeg", Math.min(quality + 0.05, 0.85));
    return { blob: jpeg, ext: "jpg" };
  } finally {
    bitmap.close();
  }
}
