// Content safety helpers for CMS-rendered media, news, and
// opportunities. Design rules:
//   * News content is plain text rendered as React text nodes
//     (React escapes output), so no HTML sanitizer is required.
//   * Videos are trusted embeds only (YouTube / Vimeo ids) or a
//     direct https media_url — never arbitrary iframes.
//   * Every URL that reaches an <a href>, <img src>, or iframe
//     src goes through an https-only allowlist here.

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID = /^\d{1,12}$/;

/** Returns the url when it is a parseable https URL, else null. */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Extract a YouTube video id from common URL shapes, else null. */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{6,20})/i,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{6,20})/i,
    /(?:youtube\.com\/(?:embed|shorts|live)\/)([A-Za-z0-9_-]{6,20})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Extract a Vimeo video id from common URL shapes, else null. */
export function extractVimeoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (VIMEO_ID.test(value)) return value;
  const match = value.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d{1,12})/i);
  return match?.[1] ?? null;
}

/**
 * Privacy-enhanced YouTube embed URL for a validated id, else null.
 * The id is URL-encoded after matching the strict charset, so it
 * cannot contain query/hash injection characters.
 */
export function youtubeEmbedUrl(id: string | null | undefined): string | null {
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
}

/** Vimeo player embed URL for a validated id, else null. */
export function vimeoEmbedUrl(id: string | null | undefined): string | null {
  if (!id || !VIMEO_ID.test(id)) return null;
  return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
}

export interface MediaEmbedSource {
  kind: "youtube" | "vimeo" | "file" | "image" | "none";
  src: string | null;
}

/**
 * Resolve a media row to a single safe display source.
 * Image items render their thumbnail; video items prefer the
 * trusted YouTube/Vimeo embed, then an https media_url.
 */
export function mediaDisplaySource(item: {
  type: "image" | "video";
  thumbnail_url: string;
  media_url: string | null;
  youtube_id: string | null;
  vimeo_id: string | null;
}): MediaEmbedSource {
  if (item.type === "image") {
    return { kind: "image", src: safeHttpUrl(item.thumbnail_url) };
  }
  const yt = youtubeEmbedUrl(item.youtube_id);
  if (yt) return { kind: "youtube", src: yt };
  const vimeo = vimeoEmbedUrl(item.vimeo_id);
  if (vimeo) return { kind: "vimeo", src: vimeo };
  return { kind: "file", src: safeHttpUrl(item.media_url) };
}

/**
 * Split plain-text article content into paragraphs on blank
 * lines. Output is rendered as React text nodes, which escape
 * HTML — this is the XSS boundary for news content.
 */
export function contentToParagraphs(content: string | null | undefined): string[] {
  if (!content) return [];
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim().split("\n").map((line) => line.trim()).join(" "))
    .filter((block) => block.length > 0);
}

/** Rough reading time in minutes from plain-text content (min 1). */
export function estimateReadTime(content: string | null | undefined): number {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Truncate to a max length on a word boundary, appending an ellipsis. */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  const value = (text ?? "").trim();
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > maxLength * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Form input constraint: reject javascript:, data:, vbscript: etc. */
export function isSafeTextInputUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true;
  const value = url.trim().toLowerCase();
  return value.startsWith("https://") || value.startsWith("http://") || value.startsWith("mailto:");
}
