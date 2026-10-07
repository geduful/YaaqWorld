import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];

  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}