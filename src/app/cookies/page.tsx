import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "YAAQ World's cookie policy — how we use cookies and similar tracking technologies on our website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="cookies-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <h1 id="cookies-heading" className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Cookie Policy
            </h1>
            <p className="mt-4 text-white/70">Last updated: {new Date().toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="cookies-content">
        <div className="container-yaaq max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="lead text-muted-foreground">
              This Cookie Policy explains how YAAQ World (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies and similar technologies on our website.
            </p>

            <h2>What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website function properly, remember your preferences, and provide analytics.</p>

            <h2>Types of Cookies We Use</h2>

            <h3>1. Essential Cookies (Strictly Necessary)</h3>
            <p>These cookies are required for the website to function and cannot be disabled:</p>
            <ul>
              <li>Session management</li>
              <li>Security and fraud prevention</li>
              <li>Load balancing</li>
              <li>Cookie consent preferences</li>
            </ul>

            <h3>2. Analytics Cookies</h3>
            <p>These help us understand how visitors interact with our website:</p>
            <ul>
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Geographic location (country level)</li>
              <li>Device and browser information</li>
            </ul>
            <p>We use privacy-friendly analytics that do not personally identify you.</p>

            <h3>3. Functional Cookies</h3>
            <p>These enhance your experience by remembering preferences:</p>
            <ul>
              <li>Language preference</li>
              <li>Theme preference (light/dark mode)</li>
              <li>Form data retention</li>
            </ul>

            <h3>4. Marketing Cookies</h3>
            <p>We may use cookies for marketing purposes with your consent:</p>
            <ul>
              <li>Social media integration (Instagram, Twitter, YouTube embeds)</li>
              <li>Retargeting (if implemented in future)</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>Some cookies are set by third-party services that appear on our pages:</p>
            <ul>
              <li><strong>YouTube:</strong> Video embeds may set cookies</li>
              <li><strong>Social Media:</strong> Instagram, Twitter, Facebook widgets</li>
              <li><strong>Analytics:</strong> Privacy-friendly analytics provider</li>
            </ul>
            <p>We do not control these third-party cookies. Please refer to their respective privacy policies.</p>

            <h2>Managing Your Cookie Preferences</h2>
            <p>You can control cookies through:</p>
            <ul>
              <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies</li>
              <li><strong>Cookie banner:</strong> Accept or reject non-essential cookies on first visit</li>
              <li><strong>Opt-out tools:</strong> Industry opt-out platforms for advertising cookies</li>
            </ul>
            <p>Note: Disabling essential cookies may break website functionality.</p>

            <h2>Cookie Retention</h2>
            <ul>
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Persistent cookies: Typically 30 days to 1 year</li>
              <li>Consent preferences: Stored for 1 year</li>
            </ul>

            <h2>Changes to This Policy</h2>
            <p>We may update this Cookie Policy to reflect changes in our practices or legal requirements. Check this page periodically for updates.</p>

            <h2>Contact Us</h2>
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