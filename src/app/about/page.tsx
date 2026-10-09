import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { socialIcons } from "@/lib/icons";

export const metadata: Metadata = {
  title: "About YAAQ World",
  description:
    "Learn about YAAQ World — Ghana's premier campus media production and creative storytelling brand. Our story, mission, vision, and the team behind the lens.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: <socialIcons.heart className="h-6 w-6" />, title: "Authenticity", desc: "We capture real moments, not staged scenes. Every story is genuine." },
  { icon: <socialIcons.eye className="h-6 w-6" />, title: "Excellence", desc: "Professional standards in every frame, every edit, every delivery." },
  { icon: <socialIcons.users className="h-6 w-6" />, title: "Community First", desc: "Students, creators, and campus culture come before everything." },
  { icon: <socialIcons.target className="h-6 w-6" />, title: "Purpose-Driven", desc: "Every project serves the culture and moves the narrative forward." },
  { icon: <socialIcons.award className="h-6 w-6" />, title: "Recognition", desc: "Celebrating talent, effort, and achievement within the youth space." },
  { icon: <socialIcons.bookOpen className="h-6 w-6" />, title: "Growth", desc: "Continuous learning, mentorship, and elevation of the next generation." },
];

const milestones = [
  { year: "2022", title: "Founded", desc: "YAAQ World established at KTU by Mr. Abdul-Mumin" },
  { year: "2023", title: "First Major Coverage", desc: "KTU SRC Week — comprehensive multi-day documentation" },
  { year: "2023", title: "Face of KTU Partnership", desc: "Official media partner for the premier campus pageant" },
  { year: "2024", title: "Campus Tour Series Launch", desc: "Video series showcasing campus life across Ghana" },
  { year: "2024", title: "Street Quiz Format", desc: "Original content format engaging students campus-wide" },
  { year: "2024", title: "YAAQMIIN Enterprise Subsidiary", desc: "Formalized under the wider creative enterprise" },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="about-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              About YAAQ World
            </Badge>
            <h1
              id="about-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              The Story Behind the Lens
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              From a campus passion project to Ghana&apos;s leading student media brand — this is our journey.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="who-we-are-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div className="animate-in stagger-1">
              <SectionHeader
                id="who-we-are-heading"
                align="left"
                tagline="Who We Are"
                title="Capturing the Pulse of Campus Culture"
                description={
                  <>
                    <p className="text-muted-foreground">
                      YAAQ World is a Ghanaian campus media production and creative storytelling brand led by Mr. Abdul-Mumin,
                      operating strongly within tertiary environments — particularly Koforidua Technical University (KTU) in
                      Koforidua, Ghana.
                    </p>
                    <p className="mt-4 text-muted-foreground">
                      We specialize in documenting the authentic moments that define campus life: the energy of SRC Week,
                      the elegance of pageants, the curiosity of street quizzes, the discovery of campus tours,
                      and the raw emotion of behind-the-scenes moments.
                    </p>
                    <p className="mt-4 text-muted-foreground">
                      Our work spans photography, videography, lifestyle content, event coverage, creative production,
                      media partnerships, and youth event coverage. We don&apos;t just record events — we preserve culture.
                    </p>
                  </>
                }
              />
            </div>
            <div className="animate-in stagger-2 relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-yaaq-navy">
                <div className="text-center p-8">
                  <svg className="mx-auto h-16 w-16 text-yaaq-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-4 text-white/60">Team Photo Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="story-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="story-heading"
            tagline="Our Journey"
            title="Our Story & Legacy"
            description="Key milestones in our evolution from a campus initiative to a recognized media brand."
          />
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <div key={milestone.year} className={`relative pl-20 animate-in stagger-${Math.min(i + 1, 10)}`}>
                  <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-yaaq-gold text-yaaq-navy font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-xl font-bold text-yaaq-gold-ink">{milestone.year}</span>
                      <h3 className="font-display text-lg font-semibold text-foreground">{milestone.title}</h3>
                    </div>
                    <p className="mt-1 text-muted-foreground">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="mission-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="animate-in stagger-1">
              <SectionHeader
                id="mission-heading"
                align="left"
                size="sm"
                tagline="Mission"
                title="Our Mission"
                description="To authentically document, creatively amplify, and professionally preserve the stories, voices, and experiences that define Ghanaian campus culture — empowering student creators and connecting youth narratives to the wider world."
              />
            </div>
            <div className="animate-in stagger-2">
              <SectionHeader
                id="vision-heading"
                align="left"
                size="sm"
                tagline="Vision"
                title="Our Vision"
                description="To become the definitive media platform for Ghanaian youth culture — the trusted lens through which campus stories are told, the launchpad for the next generation of African creatives, and the bridge between campus culture and global audiences."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="values-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="values-heading"
            tagline="What We Stand For"
            title="Our Core Values"
            description="The principles that guide every project, every decision, and every story we tell."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <Card
                key={value.title}
                className={`bg-yaaq-navy-light border-border/50 animate-in stagger-${Math.min(i + 1, 10)}`}
              >
                <CardContent className="p-6">
                  <div className="mb-4 text-yaaq-gold">{value.icon}</div>
                  <h3 className="font-display text-lg font-semibold text-white">{value.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="founder-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="founder-heading"
            tagline="Leadership"
            title="Founder & CEO"
            description="The visionary behind YAAQ World's mission to document Ghanaian campus culture."
          />
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-yaaq-gold/10 text-yaaq-gold-ink text-3xl font-bold">
                      AM
                    </div>
                    <p className="text-muted-foreground">Portrait Placeholder</p>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="gold" className="mb-4 inline-block w-fit">
                    CEO / Founder
                  </Badge>
                  <h3 className="font-display text-2xl font-bold text-foreground">Mr. Abdul-Mumin</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Official biography and professional background to be provided. This section is structured to receive
                    the approved biography, professional journey, and leadership philosophy of YAAQ World&apos;s founder.
                  </p>
                  <div className="mt-6 flex gap-4" role="group" aria-label="YAAQ World social profiles">
                    <a
                      href="https://instagram.com/yaaq_world"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-yaaq-gold-ink transition-colors"
                      aria-label="YAAQ World on Instagram"
                    >
                      <socialIcons.instagram className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@yaaq.world"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-yaaq-gold-ink transition-colors"
                      aria-label="YAAQ World on TikTok"
                    >
                      <socialIcons.tiktok className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <a
                      href="https://linkedin.com/company/yaaqworld"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-yaaq-gold-ink transition-colors"
                      aria-label="YAAQ World on LinkedIn"
                    >
                      <socialIcons.linkedin className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="relationships-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="relationships-heading"
            tagline="Community"
            title="Institutional & Community Relationships"
            description="We're proud to work alongside and within these communities and institutions."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Koforidua Technical University (KTU)",
              "KTU Students' Representative Council (SRC)",
              "Face of KTU Organization",
              "Ghana Tertiary Students Network",
            ].map((item, i) => (
              <Card key={item} className={`animate-in stagger-${Math.min(i + 1, 10)}`}>
                <CardContent className="p-6 text-center">
                  <p className="font-medium text-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="cta-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="cta-heading"
            title="Want to Work With Us or Join the Team?"
            description="We're always looking for passionate creators, storytellers, and partners who believe in the power of campus culture."
            action={
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="gold" className="w-full sm:w-auto gap-2">
                  <Link href="/booking">
                    Book Our Media Team
                    <socialIcons.arrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
                  <Link href="/team">Join YAAQ World</Link>
                </Button>
              </div>
            }
          />
        </div>
      </section>
    </MainLayout>
  );
}