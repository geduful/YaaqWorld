import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { socialIcons } from "@/lib/icons";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with YAAQ World for bookings, partnerships, media inquiries, or to join our team. Email, phone, WhatsApp, and social media contacts.",
};

const contactInfo = {
  email: "hello@yaaqworld.com",
  phone: "+233 XX XXX XXXX",
  whatsapp: "+233 XX XXX XXXX",
  location: "Koforidua, Eastern Region, Ghana",
};

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/yaaqworld", icon: socialIcons.instagram, color: "text-pink-500" },
  { name: "Twitter", href: "https://twitter.com/yaaqworld", icon: socialIcons.twitter, color: "text-blue-400" },
  { name: "Facebook", href: "https://facebook.com/yaaqworld", icon: socialIcons.facebook, color: "text-blue-600" },
  { name: "YouTube", href: "https://youtube.com/@yaaqworld", icon: socialIcons.youtube, color: "text-red-500" },
  { name: "LinkedIn", href: "https://linkedin.com/company/yaaqworld", icon: socialIcons.linkedin, color: "text-blue-700" },
];

const contactMethods = [
  {
    icon: socialIcons.mail,
    title: "Email Us",
    desc: "General inquiries, bookings, partnerships",
    action: `mailto:${contactInfo.email}`,
    label: contactInfo.email,
  },
  {
    icon: socialIcons.phone,
    title: "Call Us",
    desc: "Direct line for urgent inquiries",
    action: `tel:${contactInfo.phone.replace(/\s/g, "")}`,
    label: contactInfo.phone,
  },
  {
    icon: socialIcons.messageSquare,
    title: "WhatsApp",
    desc: "Quick messages and media sharing",
    action: `https://wa.me/${contactInfo.whatsapp.replace(/\s|\+/g, "")}`,
    label: contactInfo.whatsapp,
    external: true,
  },
  {
    icon: socialIcons.mapPin,
    title: "Visit Us",
    desc: "Our base in Koforidua",
    action: "#",
    label: contactInfo.location,
  },
];

const faqItems = [
  {
    q: "How far in advance should I book for an event?",
    a: "We recommend booking at least 2-4 weeks in advance for campus events, and 4-6 weeks for major festivals or pageants. However, we can sometimes accommodate last-minute requests depending on availability.",
  },
  {
    q: "Do you travel outside Koforidua?",
    a: "Yes! We cover events across Ghana. Travel and accommodation costs for locations outside Koforidua are included in the project quote.",
  },
  {
    q: "What's your typical turnaround time for deliverables?",
    a: "Highlight reels: 24-48 hours. Full event edits: 5-7 business days. Photography: 3-5 business days. Custom timelines available for urgent needs.",
  },
  {
    q: "Can you live stream our event?",
    a: "Absolutely. We offer multi-camera live streaming to YouTube, Facebook, and custom RTMP destinations with professional audio and graphics.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes! We offer special rates for student organizations, SRCs, and campus clubs. Mention you're a student group when booking.",
  },
  {
    q: "How do I join YAAQ World as a creator?",
    a: "Visit our Team page and click 'Express Interest' or email us at hello@yaaqworld.com with your portfolio and area of interest.",
  },
];

export default function ContactPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="contact-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              Get In Touch
            </Badge>
            <h1
              id="contact-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Let's Start a Conversation
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              Have a project in mind? Want to partner with us? Looking to join the team?
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="contact-methods-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="contact-methods-heading"
            tagline="Contact Information"
            title="Ways to Reach Us"
            description="Choose the method that works best for you. We typically respond within 24 hours."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, i) => (
              <Card key={method.title} className={`animate-in stagger-${i + 1}`}>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold mb-4">
                    <method.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{method.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{method.desc}</p>
                  <a
                    href={method.action}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-yaaq-gold hover:gap-3 transition-all"
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                  >
                    {method.label}
                    <socialIcons.arrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="business-hours-heading">
        <div className="container-yaaq">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="animate-in stagger-1">
              <SectionHeader
                id="business-hours-heading"
                align="left"
                tagline="Availability"
                title="Business Hours"
                description="Our team is available during these hours. For urgent event-day support, we offer extended coverage."
              />
              <div className="mt-8 space-y-4">
                {[
                  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM GMT" },
                  { day: "Saturday", hours: "10:00 AM – 4:00 PM GMT" },
                  { day: "Sunday", hours: "Event days only" },
                  { day: "Event Coverage", hours: "As scheduled (including weekends/holidays)" },
                ].map((item, i) => (
                  <div key={item.day} className={`flex items-center justify-between p-4 rounded-lg bg-card border border-border animate-in stagger-${i + 1}`}>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yaaq-gold" />
                      <span className="font-medium text-foreground">{item.day}</span>
                    </div>
                    <span className="text-muted-foreground">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-in stagger-2">
              <SectionHeader
                align="left"
                tagline="Social"
                title="Follow Our Journey"
                description="Stay connected with our latest work, behind-the-scenes content, and campus culture stories."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialLinks.map((social, i) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-5 rounded-xl bg-card border border-border hover:border-yaaq-gold/50 hover:shadow-lg transition-all group animate-in stagger-${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yaaq-gold/10">
                        <social.icon className={cn("h-6 w-6", social.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-yaaq-gold transition-colors">{social.name}</p>
                        <p className="text-sm text-muted-foreground">@{social.name.toLowerCase() === "youtube" ? "yaaqworld" : "yaaqworld"}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="faq-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="faq-heading"
            tagline="FAQ"
            title="Frequently Asked Questions"
            description="Quick answers to common questions about booking, services, and working with us."
          />
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, i) => (
              <details key={item.q} className={`group rounded-xl bg-card border border-border animate-in stagger-${i + 1}`}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="font-medium text-foreground pr-8">{item.q}</h3>
                  <svg className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-yaaq-navy text-white" aria-labelledby="cta-heading">
        <div className="container-yaaq text-center">
          <SectionHeader
            id="cta-heading"
            title="Ready to Work Together?"
            description="Whether it's a campus event, brand campaign, or creative project — let's make it happen."
            action={
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/booking">
                  <Button size="lg" variant="gold" className="gap-2">
                    Book Our Media Team
                    <socialIcons.arrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/team">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
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