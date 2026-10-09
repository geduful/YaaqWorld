export type SocialPlatform = "instagram" | "linkedin" | "tiktok";

export function socialUrl(platform: SocialPlatform, value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const bare = v.replace(/^@/, "");
  if (!bare) return null;
  const hasPath = bare.includes("/");
  if (platform === "instagram") {
    return hasPath ? `https://${bare}` : `https://www.instagram.com/${bare}`;
  }
  if (platform === "tiktok") {
    return hasPath ? `https://${bare}` : `https://www.tiktok.com/@${bare}`;
  }
  if (platform === "linkedin") {
    return hasPath ? `https://${bare}` : `https://www.linkedin.com/in/${bare}`;
  }
  return null;
}
