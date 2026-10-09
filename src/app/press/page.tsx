import { Metadata } from "next";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { socialIcons } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "Official press information for YAAQ World — company boilerplate, key facts, coverage areas, and media contact details.",
  alternates: { canonical: "/press" },
};

const FACTS: { label: string; value: string }[] = [
  { label: "Founded", value: "2022" },
  { label: "Founder", value: "Mr. Abdul-Mumin" },
  { label: "Headquarters", value: "Koforidua, Eastern Region, Ghana" },
  { label: "Primary campus", value: "Koforidua Technical University (KTU)" },
  { label: "Parent company", value: "YAAQMIIN Enterprise" },
  { label: "Focus", value: "Campus media production & creative storytelling" },
];

const COVERAGE = [
  "Photography",
  "Videography",
  "Event coverage",
  "Campus tours",
  "Street quizzes",
  "Pageants & lifestyle content",
  "Media partnerships",
  "Youth event coverage",
];

export default function PressKitPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="press-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-16">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              Press Kit
            </Badge>
            <h1
              id="press-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              YAAQ World Press Information
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              Official company information for journalists, partners, and media outlets covering
              Ghanaian campus culture and creative storytelling.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="boilerplate-heading">
        <div className="container-yaaq">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader
              id="boilerplate-heading"
              tagline="Boilerplate"
              title="About YAAQ World"
              description={
                <>
                  <p className="text-muted-foreground">
                    YAAQ World is a Ghanaian campus media production and creative storytelling brand led
                    by Mr. Abdul-Mumin, operating strongly within tertiary environments — particularly
                    Koforidua Technical University (KTU) in Koforidua, Ghana. Established in 2022 as a
                    subsidiary of YAAQMIIN Enterprise, its work spans photography, videography, event
                    coverage, campus tours, street quizzes, lifestyle content, media partnerships, and
                    youth event coverage — documenting the moments that define a generation.
                  </p>
                </>
              }
            />
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="facts-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="facts-heading"
            tagline="Fact Sheet"
            title="Key Facts"
            description="Verified company details for publication."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((fact) => (
              <Card key={fact.label}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-yaaq-gold-ink">
                    {fact.label}
                  </p>
                  <p className="mt-2 font-medium text-foreground">{fact.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="coverage-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div>
              <SectionHeader
                id="coverage-heading"
                align="left"
                tagline="What We Cover"
                title="Coverage Areas"
                description="Services and content formats available for feature stories and event coverage."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {COVERAGE.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <socialIcons.star className="h-4 w-4 shrink-0 text-yaaq-gold-ink" aria-hidden="true" />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <socialIcons.mail className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
                    Media Contact
                  </CardTitle>
                  <CardDescription>For interviews, comment requests, and press enquiries.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
                    <a href="mailto:yaaqworld@gmail.com" className="mt-1 inline-block font-medium text-foreground hover:text-yaaq-gold-ink transition-colors">
                      yaaqworld@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="mt-1 font-medium text-foreground">Koforidua, Eastern Region, Ghana</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Brand Assets</CardTitle>
                  <CardDescription>
                    Logos, brand imagery, and high-resolution assets are provided on request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Email us with your outlet and intended use, and we will share the appropriate
                    asset package.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="press-links-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="press-links-heading"
            title="Latest From YAAQ World"
            description="Browse published stories, media coverage, and company updates."
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="gold" className="w-full sm:w-auto gap-2">
              <Link href="/news">
                Read the Newsroom
                <socialIcons.arrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
              <Link href="/media">Visit Media Hub</Link>
            </Button>
            <Button asChild size="lg" variant="glass" className="w-full sm:w-auto">
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
