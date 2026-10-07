import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { socialIcons } from "@/lib/icons";

export const metadata: Metadata = {
  title: "News & Stories",
  description:
    "Latest news, campus stories, event coverage, announcements, and behind-the-scenes insights from YAAQ World. Stay updated with Ghanaian campus culture.",
};

const mockNews = [
  {
    slug: "ktu-src-week-2024-recap",
    title: "KTU SRC Week 2024: A Week of Culture, Creativity & Community",
    excerpt:
      "We covered the entire SRC Week — from the opening ceremony to the grand finale. Here's our recap of the moments that defined the week, the performances that moved us, and the stories that emerged.",
    image: "/images/news/src-week-2024.jpg",
    category: "Campus Events",
    publishedAt: "2024-03-20",
    readTime: 8,
    featured: true,
  },
  {
    slug: "face-of-ktu-grand-finale-behind-lens",
    title: "Behind the Lens: Face of KTU Grand Finale",
    excerpt:
      "An exclusive look at the preparation, tension, and triumph of the Face of KTU pageant. Our team was there for every moment — from rehearsals to the crowning.",
    image: "/images/news/face-of-ktu-bts.jpg",
    category: "Pageants",
    publishedAt: "2024-02-28",
    readTime: 6,
  },
  {
    slug: "campus-tour-ktu-main-campus",
    title: "Campus Tour: Exploring Koforidua Technical University",
    excerpt:
      "Join us as we take you through KTU's iconic spots, hidden gems, and student-favorite locations in our latest campus tour series.",
    image: "/images/news/ktu-campus-tour.jpg",
    category: "Campus Tours",
    publishedAt: "2024-02-10",
    readTime: 4,
  },
  {
    slug: "street-quiz-koforidua-edition",
    title: "Street Quiz: Koforidua Edition — Knowledge Meets Culture",
    excerpt:
      "Our hit street quiz format hits the streets of Koforidua. Watch students test their knowledge, win prizes, and represent their halls.",
    image: "/images/news/street-quiz.jpg",
    category: "Street Quizzes",
    publishedAt: "2024-01-25",
    readTime: 3,
  },
  {
    slug: "yaaq-world-joins-yaaqmiin-enterprise",
    title: "YAAQ World Officially Becomes Subsidiary of YAAQMIIN Enterprise",
    excerpt:
      "We're excited to announce our formal integration into the YAAQMIIN Enterprise ecosystem, expanding our capabilities in commercial photography, digital consulting, and creative masterclasses.",
    category: "Announcements",
    publishedAt: "2024-01-15",
    readTime: 3,
  },
  {
    slug: "freshers-welcome-concert-2023",
    title: "KTU Freshers Welcome Concert 2023 — The Aftermovie",
    excerpt:
      "Relive the energy of the biggest welcome event of the academic year. Performances, crowd reactions, and the start of a new journey for freshers.",
    image: "/images/news/freshers-2023.jpg",
    category: "Campus Events",
    publishedAt: "2023-09-12",
    readTime: 5,
  },
  {
    slug: "campus-lifestyle-student-leaders",
    title: "Campus Lifestyle: Portraits of Student Leadership",
    excerpt:
      "A photo series celebrating the student leaders shaping campus culture — SRC executives, hall presidents, club heads, and change makers.",
    image: "/images/news/student-leaders.jpg",
    category: "Photography",
    publishedAt: "2023-11-05",
    readTime: 4,
  },
  {
    slug: "behind-scenes-src-week-prep",
    title: "Behind the Scenes: Preparing for SRC Week Coverage",
    excerpt:
      "What goes into covering a week-long campus festival? Our production team shares the planning, gear, and coordination behind the scenes.",
    category: "Behind the Scenes",
    publishedAt: "2024-03-18",
    readTime: 4,
  },
];

export default function NewsPage() {
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
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <SectionHeader
              id="news-grid-heading"
              align="left"
              tagline="All Stories"
              title="Latest Articles"
              description="Browse our latest coverage of campus events, culture, and community."
            />
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <socialIcons.filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <socialIcons.search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {mockNews.map((article, i) => (
              <NewsCard key={article.slug} article={article} className={`animate-in stagger-${i + 1}`} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="categories-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="categories-heading"
            tagline="Categories"
            title="Browse by Topic"
            description="Explore stories organized by category."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Campus Events", count: 12, icon: socialIcons.calendar },
              { name: "Pageants", count: 5, icon: socialIcons.award },
              { name: "Campus Tours", count: 8, icon: socialIcons.mapPinIcon },
              { name: "Street Quizzes", count: 6, icon: socialIcons.helpCircle },
              { name: "Behind the Scenes", count: 4, icon: socialIcons.video },
              { name: "Photography", count: 10, icon: socialIcons.image },
              { name: "Announcements", count: 3, icon: socialIcons.megaphone },
              { name: "Student Features", count: 7, icon: socialIcons.users },
            ].map((cat, i) => (
              <Link
                key={cat.name}
                href={`/news?category=${cat.name.toLowerCase().replace(" ", "-")}`}
                className={`p-5 rounded-xl bg-card border border-border hover:border-yaaq-gold/50 transition-colors group animate-in stagger-${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground group-hover:text-yaaq-gold transition-colors">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.count} articles</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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