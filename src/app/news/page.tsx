import { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { socialIcons } from "@/lib/icons";
import { categoryLabel, NEWS_CATEGORY_OPTIONS } from "@/lib/content-categories";
import { getPublishedNews } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Stories",
  description:
    "Latest news, campus stories, event coverage, announcements, and behind-the-scenes insights from YAAQ World. Stay updated with Ghanaian campus culture.",
  alternates: { canonical: "/news" },
};

interface NewsPageProps {
  searchParams: { category?: string };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const articles = await getPublishedNews();
  const activeCategory = searchParams.category?.trim() || null;

  const visibleArticles = activeCategory
    ? articles.filter((article) => article.category === activeCategory)
    : articles;

  const categoryCounts = new Map<string, number>();
  for (const article of articles) {
    categoryCounts.set(article.category, (categoryCounts.get(article.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="news-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              News & Stories
            </Badge>
            <h1
              id="news-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Latest from Campus Culture
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              Campus stories, event coverage, announcements, and behind-the-scenes insights from the YAAQ World team.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="news-grid-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="news-grid-heading"
            align="left"
            tagline={activeCategory ? categoryLabel(activeCategory, NEWS_CATEGORY_OPTIONS) : "All Stories"}
            title={activeCategory ? "Filtered Articles" : "Latest Articles"}
            description={
              activeCategory
                ? `Stories filed under ${categoryLabel(activeCategory, NEWS_CATEGORY_OPTIONS)}.`
                : "Browse our latest coverage of campus events, culture, and community."
            }
            action={
              activeCategory ? (
                <Link href="/news">
                  <Button variant="outline" size="sm">
                    Clear filter
                  </Button>
                </Link>
              ) : undefined
            }
          />

          {visibleArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {activeCategory ? "No articles in this category yet" : "No published stories yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                {activeCategory
                  ? "Try another category, or check back soon for new coverage."
                  : "New stories will appear here as soon as they are published."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article, i) => (
                <NewsCard
                  key={article.id}
                  article={{
                    slug: article.slug,
                    title: article.title,
                    excerpt: article.excerpt,
                    image: article.featured_image_url ?? undefined,
                    category: categoryLabel(article.category, NEWS_CATEGORY_OPTIONS),
                    publishedAt: article.published_at ?? article.created_at,
                    readTime: article.read_time,
                    featured: article.featured,
                  }}
                  className={`animate-in stagger-${Math.min(i + 1, 6)}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section-py bg-muted/30" aria-labelledby="categories-heading">
          <div className="container-yaaq">
            <SectionHeader
              id="categories-heading"
              tagline="Categories"
              title="Browse by Topic"
              description="Explore stories organized by category."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(([value, count], i) => (
                <Link
                  key={value}
                  href={`/news?category=${encodeURIComponent(value)}`}
                  className={`p-5 rounded-xl bg-card border border-border hover:border-yaaq-gold/50 transition-colors group animate-in stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold">
                      <socialIcons.bookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-yaaq-gold transition-colors">
                        {categoryLabel(value, NEWS_CATEGORY_OPTIONS)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {count} {count === 1 ? "article" : "articles"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="newsletter-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="newsletter-heading"
            title="Stay Updated"
            description="Get the latest campus stories, event announcements, and behind-the-scenes content delivered to your inbox."
            action={
              <form className="max-w-md mx-auto flex gap-2" action="/newsletter" method="POST">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-yaaq-gold focus:ring-2 focus:ring-yaaq-gold/50"
                  aria-label="Email address"
                />
                <Button type="submit" variant="gold" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            }
          />
        </div>
      </section>
    </MainLayout>
  );
}
