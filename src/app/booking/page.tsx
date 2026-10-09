import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { BookingForm } from "@/components/booking/booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Camera, Video, Target, Star, Check } from "lucide-react";
import { BookingCTAClient } from "@/components/booking/booking-cta-client";

export const metadata: Metadata = {
  title: "Book Our Media Team",
  description:
    "Book YAAQ World's professional media team for your campus event, brand activation, photography, videography, or creative project. Event coverage, campus campaigns, brand activations, and more.",
  alternates: { canonical: "/booking" },
};

const serviceCategories = [
  {
    id: "event-coverage",
    title: "Event Coverage",
    desc: "Multi-camera coverage of campus events, SRC weeks, pageants, concerts, and youth gatherings.",
    icon: Video,
    features: ["Live streaming", "Highlight reels", "Same-day edits", "Photo + video"],
  },
  {
    id: "brand-activation",
    title: "Brand Activation",
    desc: "Creative campus activations, experiential marketing, and youth-focused brand experiences.",
    icon: Target,
    features: ["Experiential design", "Pop-up events", "Brand ambassadors", "Interactive installations"],
  },
  {
    id: "campus-campaign",
    title: "Campus Campaign",
    desc: "Strategic influencer campaigns leveraging our network of campus creators and student leaders.",
    icon: Users,
    features: ["Creator network", "Campaign strategy", "Content coordination", "Performance tracking"],
  },
  {
    id: "photography",
    title: "Photography",
    desc: "Editorial and documentary photography for events, portraits, lifestyle, and behind-the-scenes.",
    icon: Camera,
    features: ["Event photography", "Portraits", "Lifestyle", "Professional retouching"],
  },
  {
    id: "videography",
    title: "Videography",
    desc: "Cinematic video production for documentaries, promotional content, and brand storytelling.",
    icon: Video,
    features: ["Documentary style", "Promotional videos", "Social media content", "Color grading"],
  },
  {
    id: "media-partnership",
    title: "Media Partnership",
    desc: "Official media partnerships for campus events, festivals, pageants, and youth programs.",
    icon: Star,
    features: ["Official media partner", "Content distribution", "Cross-platform promotion", "Press coordination"],
  },
  {
    id: "creative-consulting",
    title: "Creative Consulting",
    desc: "Strategic creative direction, content strategy, and youth culture insights for brands.",
    icon: Target,
    features: ["Creative strategy", "Content planning", "Youth insights", "Workshop facilitation"],
  },
  {
    id: "other",
    title: "Other / Custom",
    desc: "Custom media solutions tailored to your unique requirements.",
    icon: Star,
    features: ["Custom packages", "Flexible delivery", "Dedicated producer", "Scalable solutions"],
  },
];

const processSteps = [
  { step: "01", title: "Submit Request", desc: "Fill out our booking form with your event details and requirements." },
  { step: "02", title: "Consultation", desc: "We'll contact you within 24 hours to discuss your project in detail." },
  { step: "03", title: "Proposal", desc: "Receive a detailed proposal with scope, timeline, and investment." },
  { step: "04", title: "Production", desc: "Our team executes with professional equipment and creative expertise." },
  { step: "05", title: "Delivery", desc: "Polished deliverables optimized for your channels, on time and on brief." },
];

export default function BookingPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="booking-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              Book Our Team
            </Badge>
            <h1
              id="booking-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Let&apos;s Create Something Memorable
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              From campus festivals to brand campaigns, we bring professional media production
              and authentic storytelling to every project.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="booking-form-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 animate-in stagger-1">
              <SectionHeader
                id="booking-form-heading"
                align="left"
                tagline="Booking Request"
                title="Tell Us About Your Project"
                description="Fill out the form and our team will reach out within 24 hours to discuss your vision and provide a tailored proposal."
              />
              <BookingForm />
            </div>

            <div className="animate-in stagger-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">What Happens Next?</h3>
                  <div className="space-y-4">
                    {processSteps.map((step) => (
                      <div key={step.step} className="flex gap-4">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-yaaq-gold/10 text-yaaq-gold-ink font-bold text-sm">
                          {step.step}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Service Categories</h3>
                  <div className="space-y-3">
                    {serviceCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="w-full text-left p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold-ink">
                            <cat.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cat.title}</p>
                            <p className="text-sm text-muted-foreground">{cat.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">Why Choose YAAQ World?</h3>
                  <ul className="space-y-3" role="list">
                    {[
                      "Deep understanding of Ghanaian campus culture",
                      "Professional broadcast-quality equipment",
                      "Experienced team with campus event expertise",
                      "Fast turnaround — same-day edits available",
                      "Flexible packages for student budgets",
                      "End-to-end production from concept to delivery",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 shrink-0 mt-0.5 text-yaaq-gold-ink" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="services-overview-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="services-overview-heading"
            tagline="Our Services"
            title="Choose Your Service"
            description="Select the service that best fits your needs. Each includes professional production and post-production."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((cat, i) => (
              <Card key={cat.id} className={`animate-in stagger-${Math.min(i + 1, 6)}`}>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold-ink mb-4">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{cat.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{cat.desc}</p>
                  <ul className="mt-4 space-y-2" role="list">
                    {cat.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-yaaq-gold-ink" />
                        {feature}
                      </li>
                    ))}
                  </ul>
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
            title="Ready to Start Your Project?"
            description="Submit a booking request or reach out directly. We're here to bring your vision to life."
            action={<BookingCTAClient />}
          />
        </div>
      </section>
    </MainLayout>
  );
}