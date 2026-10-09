import { Metadata } from "next";
import { LegalPage, LegalCallout } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "YAAQ World's cookie policy — how we use cookies and similar tracking technologies on our website.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={
        <>
          This Cookie Policy explains how YAAQ World (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies
          and similar technologies on our website.
        </>
      }
      sections={[
        {
          id: "what-are-cookies",
          number: 1,
          title: "What Are Cookies?",
          content: (
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the website
              function properly, remember your preferences, and provide analytics.
            </p>
          ),
        },
        {
          id: "types-of-cookies",
          number: 2,
          title: "Types of Cookies We Use",
          content: (
            <>
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
            </>
          ),
        },
        {
          id: "third-party-cookies",
          number: 3,
          title: "Third-Party Cookies",
          content: (
            <>
              <p>Some cookies are set by third-party services that appear on our pages:</p>
              <ul>
                <li>
                  <strong>YouTube:</strong> Video embeds may set cookies
                </li>
                <li>
                  <strong>Social Media:</strong> Instagram, Twitter, Facebook widgets
                </li>
                <li>
                  <strong>Analytics:</strong> Privacy-friendly analytics provider
                </li>
              </ul>
              <p>We do not control these third-party cookies. Please refer to their respective privacy policies.</p>
            </>
          ),
        },
        {
          id: "managing-preferences",
          number: 4,
          title: "Managing Your Cookie Preferences",
          content: (
            <>
              <p>You can control cookies through:</p>
              <ul>
                <li>
                  <strong>Browser settings:</strong> Most browsers allow you to block or delete cookies
                </li>
                <li>
                  <strong>Cookie banner:</strong> Accept or reject non-essential cookies on first visit
                </li>
                <li>
                  <strong>Opt-out tools:</strong> Industry opt-out platforms for advertising cookies
                </li>
              </ul>
              <LegalCallout>
                <strong>Note:</strong> Disabling essential cookies may break website functionality.
              </LegalCallout>
            </>
          ),
        },
        {
          id: "cookie-retention",
          number: 5,
          title: "Cookie Retention",
          content: (
            <ul>
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Persistent cookies: Typically 30 days to 1 year</li>
              <li>Consent preferences: Stored for 1 year</li>
            </ul>
          ),
        },
        {
          id: "changes-to-this-policy",
          number: 6,
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Cookie Policy to reflect changes in our practices or legal requirements. Check this
              page periodically for updates.
            </p>
          ),
        },
      ]}
    />
  );
}
