import Link from "next/link";
import { socialIcons } from "@/lib/icons";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
    { name: "Media Hub", href: "/media" },
    { name: "News", href: "/news" },
    { name: "Careers", href: "/team#join" },
  ],
  services: [
    { name: "Event Coverage", href: "/services#event-coverage" },
    { name: "Photography", href: "/services#photography" },
    { name: "Videography", href: "/services#videography" },
    { name: "Brand Activations", href: "/services#brand-activations" },
    { name: "Creative Consulting", href: "/services#creative-consulting" },
  ],
  resources: [
    { name: "Booking", href: "/booking" },
    { name: "Media Partnerships", href: "/services#media-partnerships" },
    { name: "Campus Campaigns", href: "/services#campus-campaigns" },
    { name: "Press Kit", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Use", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/yaaqworld", icon: socialIcons.instagram },
  { name: "Twitter", href: "https://twitter.com/yaaqworld", icon: socialIcons.twitter },
  { name: "Facebook", href: "https://facebook.com/yaaqworld", icon: socialIcons.facebook },
  { name: "YouTube", href: "https://youtube.com/@yaaqworld", icon: socialIcons.youtube },
  { name: "LinkedIn", href: "https://linkedin.com/company/yaaqworld", icon: socialIcons.linkedin },
];

const contactInfo = {
  email: "hello@yaaqworld.com",
  phone: "+233 XX XXX XXXX",
  whatsapp: "+233 XX XXX XXXX",
  location: "Koforidua, Eastern Region, Ghana",
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30" role="contentinfo">
      <div className="container-yaaq py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2" aria-label="YAAQ World Home">
              <span className="font-display text-2xl font-bold text-foreground">
                YAAQ<span className="text-yaaq-gold">World</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The pulse of Ghanaian campus culture & creative storytelling. Capturing the people,
              moments, events, and experiences shaping youth culture across Ghana.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-yaaq-gold transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="space-y-4" aria-labelledby="company-heading">
            <h3 id="company-heading" className="font-semibold text-foreground">
              Company
            </h3>
            <ul className="space-y-2" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-4" aria-labelledby="services-heading">
            <h3 id="services-heading" className="font-semibold text-foreground">
              Services
            </h3>
            <ul className="space-y-2" role="list">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-4" aria-labelledby="resources-heading">
            <h3 id="resources-heading" className="font-semibold text-foreground">
              Resources
            </h3>
            <ul className="space-y-2" role="list">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4" aria-labelledby="contact-heading">
            <h3 id="contact-heading" className="font-semibold text-foreground">
              Contact
            </h3>
            <address className="not-italic text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <socialIcons.mail className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-foreground transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <socialIcons.phone className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <socialIcons.mapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{contactInfo.location}</span>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} YAAQ World. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              A Subsidiary of YAAQMIIN Enterprise
            </p>
            <nav className="flex items-center gap-6" aria-label="Legal">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}