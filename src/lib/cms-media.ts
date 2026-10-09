import { compressImage, storagePathFromPublicUrl } from "@/lib/image";
import { getBrowserClient } from "@/lib/supabase-browser";

const CMS_BUCKET = "media";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/**
 * Compress and upload a CMS image (media thumbnails, news featured
 * images) into the media bucket under the signed-in admin's folder.
 * Returns the public URL.
 */
export async function uploadCmsImage(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be smaller than 25MB.");
  }

  const { blob, ext } = await compressImage(file, { maxEdge: 1600, quality: 0.8 });
  const path = `${userId}/cms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = getBrowserClient();
  const { error } = await supabase.storage
    .from(CMS_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) {
    const message = error.message ?? "";
    if (message.toLowerCase().includes("security") || message.toLowerCase().includes("policy")) {
      throw new Error("You don't have permission to upload media files.");
    }
    throw new Error("Upload failed. Please try again.");
  }

  const { data } = supabase.storage.from(CMS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort cleanup of a CMS image; ignores missing paths. */
export async function deleteCmsImageByUrl(url: string | null | undefined): Promise<void> {
  const path = storagePathFromPublicUrl(url ?? "", CMS_BUCKET);
  if (!path) return;
  const supabase = getBrowserClient();
  await supabase.storage.from(CMS_BUCKET).remove([path]);
}

/** True when the url points at our CMS media bucket. */
export function isCmsImageUrl(url: string | null | undefined): boolean {
  return Boolean(storagePathFromPublicUrl(url ?? "", CMS_BUCKET));
}
