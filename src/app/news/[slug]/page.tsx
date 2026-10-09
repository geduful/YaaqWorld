import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { contentToParagraphs, truncateText } from "@/lib/content";
import { categoryLabel, NEWS_CATEGORY_OPTIONS } from "@/lib/content-categories";
import { formatDate } from "@/lib/utils";
import { getPublishedNewsBySlug } from "@/lib/public-content";

export const dynamic = "force-dynamic";

interface NewsDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const article = await getPublishedNewsBySlug(params.slug);
  if (!article) {
    return { title: "News" };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || truncateText(article.excerpt, 155);

  return {
    title,
    description,
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      images: article.featured_image_url ? [{ url: article.featured_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.featured_image_url ? [article.featured_image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const article = await getPublishedNewsBySlug(params.slug);
  if (!article) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yaaqworld.com";
  const paragraphs = contentToParagraphs(article.content);
  const publishedAt = article.published_at ?? article.created_at;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: publishedAt,
    dateModified: article.updated_at,
    articleSection: categoryLabel(article.category, NEWS_CATEGORY_OPTIONS),
    keywords: article.tags.join(", "),
    image: article.featured_image_url ? [article.featured_image_url] : undefined,
    author: article.author_name
      ? { "@type": "Person", name: article.author_name }
      : { "@type": "Organization", name: "YAAQ World" },
    publisher: {
      "@type": "Organization",
      name: "YAAQ World",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/news/${article.slug}`,
    },
  };

  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="article-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-16">
          <div className="max-w-3xl animate-in stagger-1">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-yaaq-gold transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>
            <Badge variant="gold" className="mb-4 inline-block">
              {categoryLabel(article.category, NEWS_CATEGORY_OPTIONS)}
            </Badge>
            <h1
              id="article-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance"
            >
              {article.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {article.read_time} min read
              </span>
              {article.author_name && <span>By {article.author_name}</span>}
            </div>
          </div>
        </div>
      </section>

      <article className="section-py bg-background">
        <div className="container-yaaq max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />

          {article.featured_image_url && (
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-10 animate-in stagger-1">
              <Image
                src={article.featured_image_url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <p className="text-xl text-foreground leading-relaxed font-medium mb-8">{article.excerpt}</p>

          <div className="space-y-6 break-words">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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
            <Link href="/news">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                More stories
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
