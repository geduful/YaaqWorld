import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "YAAQ World's privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="privacy-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <h1 id="privacy-heading" className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-white/70">Last updated: {new Date().toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="privacy-content">
        <div className="container-yaaq max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="lead text-muted-foreground">
              YAAQ World ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personally identifiable information when you voluntarily submit it through our booking forms, contact forms, newsletter signups, or team interest forms. This may include:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Organization/Institution</li>
              <li>Event details and requirements</li>
            </ul>

            <h3>Usage Data</h3>
            <p>We automatically collect certain information when you visit our website:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Device information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To process booking requests and provide media services</li>
              <li>To respond to inquiries and communicate with you</li>
              <li>To send newsletters and updates (with your consent)</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
              <li>To prevent fraud and ensure security</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul>
              <li>With service providers who assist in our operations (hosting, analytics, email)</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a business merger, acquisition, or sale of assets</li>
            </ul>

            <h2>4. Data Storage & Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
            <p>Your data may be stored on servers located in Ghana and/or other countries where our service providers operate. By using our services, you consent to this transfer.</p>

            <h2>5. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Erase your data ("right to be forgotten")</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:hello@yaaqworld.com" className="text-yaaq-gold hover:underline">hello@yaaqworld.com</a>.</p>

            <h2>6. Cookies & Tracking</h2>
            <p>Our website uses cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. See our <a href="/cookies" className="text-yaaq-gold hover:underline">Cookie Policy</a> for details.</p>

            <h2>7. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites (social media, YouTube, etc.). We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies.</p>

            <h2>8. Children's Privacy</h2>
            <p>Our services are not directed to individuals under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>

            <h2>9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated "Last updated" date.</p>

            <h2>10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
            <address className="not-italic">
              <p>YAAQ World</p>
              <p>Koforidua, Eastern Region, Ghana</p>
              <p>Email: <a href="mailto:hello@yaaqworld.com" className="text-yaaq-gold hover:underline">hello@yaaqworld.com</a></p>
            </address>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}