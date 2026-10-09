import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { mediaDisplaySource, truncateText } from "@/lib/content";
import { categoryLabel, MEDIA_CATEGORY_OPTIONS } from "@/lib/content-categories";
import { getPublishedMediaBySlug } from "@/lib/public-content";

export const dynamic = "force-dynamic";

interface MediaDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: MediaDetailPageProps): Promise<Metadata> {
  const item = await getPublishedMediaBySlug(params.slug);
  if (!item) {
    return { title: "Media" };
  }

  const description =
    item.description !== null
      ? truncateText(item.description, 155)
      : `${item.type === "video" ? "Watch" : "View"} "${item.title}" on the YAAQ World media hub.`;

  return {
    title: item.title,
    description,
    alternates: { canonical: `/media/${item.slug}` },
    openGraph: {
      title: item.title,
      description,
      images: item.thumbnail_url ? [{ url: item.thumbnail_url }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: item.thumbnail_url ? [item.thumbnail_url] : undefined,
    },
  };
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const item = await getPublishedMediaBySlug(params.slug);
  if (!item) notFound();

  const source = mediaDisplaySource(item);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.type === "video" ? "VideoObject" : "ImageObject",
    name: item.title,
    description: item.description ?? undefined,
    thumbnailUrl: item.thumbnail_url || undefined,
    contentUrl: source.kind === "file" ? source.src ?? undefined : undefined,
    embedUrl:
      source.kind === "youtube" || source.kind === "vimeo" ? source.src ?? undefined : undefined,
    uploadDate: item.created_at,
  };

  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="media-detail-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-16">
          <div className="max-w-3xl animate-in stagger-1">
            <Link
              href="/media"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-yaaq-gold transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Media Hub
            </Link>
            <Badge variant="gold" className="mb-4 inline-block">
              {categoryLabel(item.category, MEDIA_CATEGORY_OPTIONS)}
            </Badge>
            <h1
              id="media-detail-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance"
            >
              {item.title}
            </h1>
            <p className="mt-4 text-sm text-white/60">
              {new Date(item.published_at ?? item.created_at).toLocaleDateString("en-GH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {item.duration ? ` · ${item.duration}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background">
        <div className="container-yaaq max-w-4xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />

          <Card className="overflow-hidden animate-in stagger-1">
            <CardContent className="p-0">
              {source.src ? (
                source.kind === "youtube" || source.kind === "vimeo" ? (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={source.src}
                      title={item.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : source.kind === "file" ? (
                  <video src={source.src} controls className="w-full bg-black" />
                ) : (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={source.src}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 896px"
                      className="object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted text-muted-foreground text-sm">
                  Media file unavailable
                </div>
              )}
            </CardContent>
          </Card>

          {item.description && (
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          )}

          {item.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link href="/media">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse more media
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
