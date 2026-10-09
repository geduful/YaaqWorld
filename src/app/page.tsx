import { Metadata } from "next";
import { ReactNode } from "react";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { HeroSlideshow, getHeroSlides } from "@/components/home/hero-slideshow";
import { SectionHeader } from "@/components/ui/section-header";
import { Stats } from "@/components/home/stats";
import { ServiceCard } from "@/components/services/service-card";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { socialIcons } from "@/lib/icons";
import { getActiveServices, getPublishedMedia, getPublishedNews } from "@/lib/public-content";
import { categoryLabel, NEWS_CATEGORY_OPTIONS } from "@/lib/content-categories";
import { Service } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Pulse of Ghanaian Campus Culture & Creative Storytelling",
  description:
    "YAAQ World captures the people, moments, events, and stories shaping Ghanaian campus culture through professional media production and creative storytelling. Photography, videography, event coverage, and campus tours.",
  alternates: { canonical: "/" },
};

const CATEGORY_ICONS: Record<Service["category"], ReactNode> = {
  core: <socialIcons.video className="h-6 w-6" />,
  partnership: <socialIcons.megaphone className="h-6 w-6" />,
  consulting: <socialIcons.lightbulb className="h-6 w-6" />,
  content: <socialIcons.star className="h-6 w-6" />,
};

const CATEGORY_LABELS: Record<Service["category"], string> = {
  core: "Core Service",
  partnership: "Partnership",
  consulting: "Consulting",
  content: "Content",
};

const homeStats = [
  { label: "Campuses Covered", value: null, icon: <socialIcons.mapPinIcon className="h-8 w-8" /> },
  { label: "Events Captured", value: null, icon: <socialIcons.star className="h-8 w-8" /> },
  { label: "Registered Creators", value: null, icon: <socialIcons.users className="h-8 w-8" /> },
  { label: "Media Partnerships", value: null, icon: <socialIcons.target className="h-8 w-8" /> },
];

export default async function HomePage() {
  const [services, news, media] = await Promise.all([
    getActiveServices(),
    getPublishedNews(),
    getPublishedMedia(),
  ]);

  const featuredServices = services.slice(0, 6);
  const latestNews = news.slice(0, 3);
  const featuredMedia = media.slice(0, 4);

  return (
    <MainLayout>
      <section className="relative flex min-h-screen items-center bg-yaaq-navy" aria-labelledby="hero-heading">
        <HeroSlideshow className="absolute inset-0" slides={getHeroSlides()} />
        <div className="relative w-full container-yaaq py-24 lg:py-32">
          <div className="max-w-3xl animate-in stagger-1">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-12 bg-yaaq-gold" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-yaaq-gold-light">
                Ghana&apos;s Premier Campus Media Brand
              </span>
            </div>
            <h1
              id="hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.05] text-balance"
            >
              The Pulse of Ghanaian Campus Culture &amp; Creative Storytelling
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
              We capture the people, moments, events, and experiences shaping Ghanaian campus culture.
              From SRC weeks to street quizzes, campus tours to pageants — we&apos;re there for every story.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="xl" variant="gold" className="gap-2">
                <Link href="/auth/register">
                  Join YAAQ World
                  <socialIcons.arrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glass">
                <Link href="/booking">Book Our Media Team</Link>
              </Button>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-1/2 h-20 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/40 to-transparent"
          aria-hidden="true"
        />
      </section>

      <section className="section-py bg-background" aria-labelledby="intro-heading">
        <div className="container-yaaq">
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              id="intro-heading"
              tagline="Who We Are"
              title="Capturing Campus Culture Since Day One"
              description={
                <>
                  <p className="text-muted-foreground">
                    YAAQ World is a Ghanaian campus media production and creative storytelling brand led by Mr. Abdul-Mumin,
                    operating strongly within tertiary environments — particularly Koforidua Technical University (KTU) in
                    Koforidua, Ghana.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    Our core activities span campus media, student-life storytelling, photography, videography, lifestyle content,
                    event coverage, campus tours, street quizzes, creative production, media partnerships, and youth event coverage.
                    We don&apos;t just document events — we tell the stories that define a generation.
                  </p>
                </>
              }
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { icon: <socialIcons.camera className="h-6 w-6" />, title: "Authentic Storytelling", desc: "Real moments, real people, real stories from campus life." },
                { icon: <socialIcons.video className="h-6 w-6" />, title: "Professional Production", desc: "Broadcast-quality equipment and post-production workflows." },
                { icon: <socialIcons.users className="h-6 w-6" />, title: "Youth-First Perspective", desc: "Created by students, for students — we understand the culture." },
              ].map((item, i) => (
                <div key={item.title} className={`text-center animate-in stagger-${Math.min(i + 1, 10)}`}>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold-ink">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="services-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="services-heading"
            tagline="What We Do"
            title="Our Core Services"
            description="Professional media production services tailored for campus events, youth brands, and creative storytelling."
            action={
              <Link href="/services">
                <Button variant="outline">View All Services</Button>
              </Link>
            }
          />
          {featuredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                Service catalogue being prepared
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Our services will be listed here shortly. Meanwhile, you can tell us about your
                project through the booking form.
              </p>
              <Link href="/booking" className="mt-6 inline-block">
                <Button variant="gold">Book our team</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  description={service.short_description || service.description}
                  href="/booking"
                  icon={CATEGORY_ICONS[service.category]}
                  category={CATEGORY_LABELS[service.category]}
                  className={`animate-in stagger-${Math.min(i + 1, 6)}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="experience-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="animate-in stagger-1">
              <SectionHeader
                id="experience-heading"
                align="left"
                tagline="The YAAQ World Experience"
                title="More Than Media — We Document Culture"
                description={
                  <>
                    <p className="text-muted-foreground">
                      YAAQ World isn&apos;t just a media company — we&apos;re cultural archivists of the Ghanaian campus experience.
                      Every frame we capture, every story we tell, becomes part of the collective memory of a generation.
                    </p>
                    <p className="mt-4 text-muted-foreground">
                      From the electric energy of SRC Week to the quiet anticipation before a pageant crown is placed,
                      from spontaneous street quiz battles to organized campus tours — we&apos;re there with professional equipment
                      and an intuitive understanding of what makes these moments matter.
                    </p>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "SRC Week Coverage",
                  "Face of KTU Pageants",
                  "Campus Tours",
                  "Street Quizzes",
                  "Behind the Scenes",
                  "Student Features",
                ].map((item, i) => (
                  <div
                    key={item}
                    className={`p-4 rounded-xl bg-muted/50 border border-border animate-in stagger-${Math.min(i + 1, 10)}`}
                  >
                    <p className="font-medium text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/media"
              aria-label="Watch our story — browse the media library"
              className="animate-in stagger-2 group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-yaaq-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yaaq-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <socialIcons.play className="h-20 w-20 text-white/60 group-hover:text-yaaq-gold transition-colors" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-yaaq-navy to-transparent">
                <p className="text-white/80 text-sm group-hover:text-white transition-colors">Watch our story →</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="stats-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="stats-heading"
            tagline="Our Impact"
            title="By the Numbers"
            description="Real metrics from our work across Ghanaian campuses. Data-driven storytelling with measurable reach."
          />
          <Stats stats={homeStats} />
          <p className="mt-8 text-center text-sm text-white/60">
            * Verified metrics will be updated from our admin dashboard. Placeholder values shown above.
          </p>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="media-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="media-heading"
            tagline="Featured Media"
            title="Latest from Our Lens"
            description="A curated selection of our recent photography, videography, and campus storytelling."
            action={
              <Link href="/media">
                <Button variant="outline">Explore Media Hub</Button>
              </Link>
            }
          />
          {featuredMedia.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                No published media yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Our latest photography and video work will appear here as soon as it is published.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredMedia.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/media/${item.slug}`}
                  className={`group overflow-hidden rounded-xl bg-muted animate-in stagger-${Math.min(i + 1, 4)}`}
                >
                  <div className="relative aspect-[16/9] bg-yaaq-navy overflow-hidden">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <span className="text-xs text-white/80">{item.category}</span>
                    </div>
                    {item.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 text-xs bg-black/70 text-white rounded">
                        {item.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-foreground group-hover:text-yaaq-gold-ink transition-colors">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.type === "video" ? "Video" : "Photography"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="news-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="news-heading"
            tagline="Latest Stories"
            title="News & Updates"
            description="Campus stories, event coverage, announcements, and behind-the-scenes insights from the YAAQ World team."
            action={
              <Link href="/news">
                <Button variant="outline">View All News</Button>
              </Link>
            }
          />
          {latestNews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                No published stories yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                New stories will appear here as soon as they are published.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {latestNews.map((article, i) => (
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
                  className={`animate-in stagger-${Math.min(i + 1, 3)}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="cta-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="cta-heading"
            title="Have an Event, Campaign or Story Worth Capturing?"
            description="From campus festivals to brand activations, student features to corporate partnerships — we bring professional media production and creative storytelling to every project."
            action={
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="gold" className="w-full sm:w-auto gap-2">
                  <Link href="/booking">
                    Book Our Media Team
                    <socialIcons.arrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
                  <Link href="/auth/register">Join YAAQ World</Link>
                </Button>
              </div>
            }
          />
        </div>
      </section>
    </MainLayout>
  );
}
