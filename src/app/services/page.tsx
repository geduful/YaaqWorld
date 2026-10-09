import { Metadata } from "next";
import { ReactNode } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { socialIcons } from "@/lib/icons";
import { getActiveServices } from "@/lib/public-content";
import { Service } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional media production services by YAAQ World — event coverage, photography, videography, brand activations, campus campaigns, media partnerships, and creative consulting for Ghanaian campus culture.",
  alternates: { canonical: "/services" },
};

const CATEGORY_META: Record<Service["category"], { label: string; icon: ReactNode }> = {
  core: { label: "Core Service", icon: <socialIcons.video className="h-6 w-6" /> },
  partnership: { label: "Partnership", icon: <socialIcons.megaphone className="h-6 w-6" /> },
  consulting: { label: "Consulting", icon: <socialIcons.lightbulb className="h-6 w-6" /> },
  content: { label: "Content", icon: <socialIcons.star className="h-6 w-6" /> },
};

const processSteps = [
  { step: "01", title: "Discovery", desc: "We understand your goals, audience, and vision through a detailed consultation." },
  { step: "02", title: "Strategy", desc: "We develop a creative strategy and production plan tailored to your needs." },
  { step: "03", title: "Production", desc: "Our team executes with professional equipment and creative expertise." },
  { step: "04", title: "Delivery", desc: "Polished deliverables optimized for your channels, on time and on brief." },
];

export default async function ServicesPage() {
  const services = await getActiveServices();

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
            title="Our Services"
            description="Each service is delivered with professional standards and a deep understanding of campus culture."
          />
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                Service catalogue being prepared
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Our services will be listed here shortly. Meanwhile, you can tell us about your
                project through the booking form.
              </p>
              <Button asChild variant="gold" className="mt-6">
                <Link href="/booking">Book our team</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {services.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  href="/booking"
                  icon={CATEGORY_META[service.category]?.icon}
                  image={service.image_url ?? undefined}
                  category={CATEGORY_META[service.category]?.label ?? service.category}
                  featured={service.is_featured}
                  className={`animate-in stagger-${Math.min(i + 1, 6)}`}
                />
              ))}
            </div>
          )}
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
              <Card key={step.title} className={`animate-in stagger-${Math.min(i + 1, 6)}`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-3 text-yaaq-gold-ink font-display text-2xl font-bold">{step.step}</div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
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
            tagline="Custom Solutions"
            title="Need Something Unique?"
            description="Every project is different. Tell us about your goals and we'll shape a package that fits."
            action={
              <Link href="/booking">
                <Button size="lg" variant="gold" className="gap-2">
                  Discuss Your Project
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
