import { MetadataRoute } from "next";
import { getPublishedMedia, getPublishedNews } from "@/lib/public-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yaaqworld.com";

  const staticRoutes = [
    "",
    "/about",
    "/team",
    "/services",
    "/media",
    "/news",
    "/booking",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/press",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [news, media] = await Promise.all([getPublishedNews(), getPublishedMedia()]);
    dynamicEntries = [
      ...news.map((article) => ({
        url: `${siteUrl}/news/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...media.map((item) => ({
        url: `${siteUrl}/media/${item.slug}`,
        lastModified: new Date(item.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // If CMS data is unavailable, still serve the static sitemap.
  }

  return [...staticEntries, ...dynamicEntries];
}
