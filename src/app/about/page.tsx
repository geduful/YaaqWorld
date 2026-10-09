import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { MilestoneTimeline, type Milestone } from "@/components/about/milestone-timeline";
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

const milestones: Milestone[] = [
  { year: "2026", title: "Founded", desc: "YAAQ World established at Koforidua Technical University (KTU) by Mr. Abdul-Mumin" },
  {
    year: "2026",
    title: "KTU SRC Celebration",
    desc: "Coverage of the 2026 KTU SRC Celebration, including:",
    activities: ["Face of KTU", "SRC Artist Night", "SRC Trip"],
  },
  { year: "2026", title: "KTU-COMPSSA Awards & Dinner Night", desc: "Attended and covered the Computer Science Department (COMPSSA) Awards and Dinner Night" },
  { year: "2026", title: "Ghana Parliament Sitting", desc: "Attended and covered a sitting of Ghana's Parliament" },
  { year: "2026", title: "Bistro Breeze", desc: "Attended and covered the Bistro Breeze programme" },
  { year: "2026", title: "Campus Tour Series", desc: "2026 Campus Tour for the 2026/2027 academic year" },
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
              <Image
                src="/team-photo.jpg"
                alt="The YAAQ World team"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
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
            description="Milestones from our founding year — and counting."
          />
          <MilestoneTimeline milestones={milestones} />
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
                <div className="relative aspect-square bg-muted">
                  <Image
                    src="/ceo.jpeg"
                    alt="Mr. Abdul-Mumin, Founder and CEO of YAAQ World"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
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