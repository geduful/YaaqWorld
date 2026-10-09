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
                  <p className="mt-4 text-white/50">Team Photo Placeholder</p>
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
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <div key={milestone.year} className={`relative pl-20 animate-in stagger-${i + 1}`}>
                  <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-yaaq-gold text-yaaq-navy font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-xl font-bold text-yaaq-gold">{milestone.year}</span>
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
                tagline="Mission"
                title="Our Mission"
                description="To authentically document, creatively amplify, and professionally preserve the stories, voices, and experiences that define Ghanaian campus culture — empowering student creators and connecting youth narratives to the wider world."
              />
            </div>
            <div className="animate-in stagger-2">
              <SectionHeader
                id="vision-heading"
                align="left"
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
                className={`bg-yaaq-navy-light border-border/50 animate-in stagger-${i + 1}`}
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
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-yaaq-gold/10 text-yaaq-gold text-3xl font-bold">
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
                  <div className="mt-6 flex gap-4">
                    <a href="#" className="text-muted-foreground hover:text-yaaq-gold transition-colors" aria-label="Instagram">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-yaaq-gold transition-colors" aria-label="LinkedIn">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
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
              <Card key={item} className={`animate-in stagger-${i + 1}`}>
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
                <Link href="/booking">
                  <Button size="lg" variant="gold" className="w-full sm:w-auto gap-2">
                    Book Our Media Team
                    <socialIcons.arrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/team">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                    Join YAAQ World
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </MainLayout>
  );
}