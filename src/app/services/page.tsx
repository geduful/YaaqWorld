import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { socialIcons } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional media production services by YAAQ World — event coverage, photography, videography, brand activations, campus campaigns, media partnerships, and creative consulting for Ghanaian campus culture.",
};

const serviceCategories = [
  {
    id: "event-coverage",
    title: "Event Coverage",
    description:
      "Comprehensive multi-camera coverage of campus events, SRC weeks, pageants, concerts, conferences, and youth gatherings. Includes live streaming, highlight reels, and same-day edits.",
    icon: <socialIcons.video className="h-6 w-6" />,
    features: ["Multi-camera setup", "Live streaming", "Highlight reels", "Same-day edits", "Photo + video packages"],
    cta: "Book Event Coverage",
  },
  {
    id: "photography",
    title: "Photography",
    description:
      "Editorial and documentary photography capturing authentic campus moments, portraits, lifestyle, behind-the-scenes, and event documentation with professional post-processing.",
    icon: <socialIcons.camera className="h-6 w-6" />,
    features: ["Event photography", "Portraits & headshots", "Lifestyle & candid", "Behind-the-scenes", "Professional retouching"],
    cta: "Book Photography",
  },
  {
    id: "videography",
    title: "Videography",
    description:
      "Cinematic video production for documentaries, promotional content, social media campaigns, brand storytelling, and campus culture features with full post-production.",
    icon: <socialIcons.video className="h-6 w-6" />,
    features: ["Documentary style", "Promotional videos", "Social media content", "Brand storytelling", "Color grading & sound design"],
    cta: "Book Videography",
  },
  {
    id: "brand-activations",
    title: "Brand Activations",
    description:
      "Creative campus activations, experiential marketing, pop-up events, and youth-focused brand experiences designed to engage the student demographic authentically.",
    icon: <socialIcons.target className="h-6 w-6" />,
    features: ["Experiential activations", "Pop-up experiences", "Product sampling", "Interactive installations", "Brand ambassadors"],
    cta: "Plan Activation",
  },
  {
    id: "campus-campaigns",
    title: "Campus Influencer Campaigns",
    description:
      "Strategic influencer marketing leveraging our network of campus creators, micro-influencers, and student leaders for authentic brand advocacy.",
    icon: <socialIcons.users className="h-6 w-6" />,
    features: ["Creator network access", "Campaign strategy", "Content coordination", "Performance tracking", "Authentic storytelling"],
    cta: "Launch Campaign",
  },
  {
    id: "media-partnerships",
    title: "Media Partnerships",
    description:
      "Official media partnerships for campus events, festivals, pageants, and youth programs. We provide end-to-end media production and distribution.",
    icon: <socialIcons.megaphone className="h-6 w-6" />,
    features: ["Official media partner", "Content distribution", "Cross-platform promotion", "Archival documentation", "Press coordination"],
    cta: "Partner With Us",
  },
  {
    id: "creative-consulting",
    title: "Creative Consulting",
    description:
      "Strategic creative direction, content strategy, media consulting, and youth culture insights for brands and institutions targeting the Gen Z demographic.",
    icon: <socialIcons.lightbulb className="h-6 w-6" />,
    features: ["Creative strategy", "Content planning", "Youth insights", "Brand positioning", "Workshop facilitation"],
    cta: "Get Consulting",
  },
  {
    id: "creative-production",
    title: "Creative Content Production",
    description:
      "End-to-end creative production for original formats — street quizzes, campus tours, docu-series, student features, and signature YAAQ World content.",
    icon: <socialIcons.star className="h-6 w-6" />,
    features: ["Original formats", "Series development", "Script to screen", "Talent casting", "Distribution strategy"],
    cta: "Produce Content",
  },
];

const processSteps = [
  { step: "01", title: "Discovery", desc: "We understand your goals, audience, and vision through a detailed consultation." },
  { step: "02", title: "Strategy", desc: "We develop a creative strategy and production plan tailored to your needs." },
  { step: "03", title: "Production", desc: "Our team executes with professional equipment and creative expertise." },
  { step: "04", title: "Delivery", desc: "Polished deliverables optimized for your channels, on time and on brief." },
];

export default function ServicesPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="services-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              Professional Media Services
            </Badge>
            <h1
              id="services-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Services That Capture Culture
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              From campus events to brand campaigns, we deliver professional media production
              with an authentic understanding of Ghanaian youth culture.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="services-list-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="services-list-heading"
            tagline="What We Offer"
            title="Our Service Categories"
            description="Each service is delivered with professional standards and a deep understanding of campus culture."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {serviceCategories.map((service, i) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                href="/booking"
                icon={service.icon}
                category="Core Service"
                className={`animate-in stagger-${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="process-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="process-heading"
            tagline="Our Process"
            title="How We Work"
            description="A streamlined process from concept to delivery — transparent, collaborative, and professional."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Card key={step.title} className={`animate-in stagger-${i + 1}`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-3 text-yaaq-gold font-display text-2xl font-bold">{step.step}</div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="featured-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="featured-heading"
            align="left"
            tagline="Featured Service"
            title="Event Coverage — Our Flagship Service"
            description={
              <>
                <p className="text-white/80">
                  Our most requested service — comprehensive event coverage for campus festivals, SRC weeks, pageants,
                  concerts, and youth gatherings. We bring broadcast-quality production to student events.
                </p>
                <ul className="mt-6 space-y-3 text-white/70">
                  {[
                    "Multi-camera live switching",
                    "Professional audio capture",
                    "Live streaming to multiple platforms",
                    "Same-day highlight reel delivery",
                    "Full event documentary edit",
                    "Photography + videography bundles",
                    "Drone aerial coverage (where permitted)",
                    "Post-event content packages",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yaaq-gold/20 text-yaaq-gold text-xs">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            }
            action={
              <Link href="/booking">
                <Button size="lg" variant="gold" className="gap-2">
                  Book Event Coverage
                  <socialIcons.arrowRight className="h-5 w-5" />
                </Button>
              </Link>
            }
          />
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="custom-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="custom-heading"
            tagline="Custom Solutions"
            title="Need Something Unique?"
            description="Every project is different. If you don't see exactly what you need, let's talk about a custom solution tailored to your goals."
            action={
              <Link href="/booking">
                <Button size="lg" variant="gold" className="gap-2">
                  Discuss Custom Project
                  <socialIcons.arrowRight className="h-5 w-5" />
                </Button>
              </Link>
            }
          />
        </div>
      </section>
    </MainLayout>
  );
}