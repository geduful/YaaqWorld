import { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "YAAQ World's privacy policy — how we collect, use, and protect your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <>
          YAAQ World (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
          website, use our services, or interact with us.
        </>
      }
      sections={[
        {
          id: "information-we-collect",
          number: 1,
          title: "Information We Collect",
          content: (
            <>
              <h3>Personal Information</h3>
              <p>
                We may collect personally identifiable information when you voluntarily submit it through our booking
                forms, contact forms, newsletter signups, or team interest forms. This may include:
              </p>
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
            </>
          ),
        },
        {
          id: "how-we-use-your-information",
          number: 2,
          title: "How We Use Your Information",
          content: (
            <>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li>To process booking requests and provide media services</li>
                <li>To respond to inquiries and communicate with you</li>
                <li>To send newsletters and updates (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </>
          ),
        },
        {
          id: "information-sharing",
          number: 3,
          title: "Information Sharing",
          content: (
            <>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your
                information in the following circumstances:
              </p>
              <ul>
                <li>With service providers who assist in our operations (hosting, analytics, email)</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a business merger, acquisition, or sale of assets</li>
              </ul>
            </>
          ),
        },
        {
          id: "data-storage-security",
          number: 4,
          title: "Data Storage & Security",
          content: (
            <>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the Internet or electronic storage is 100% secure.
              </p>
              <p>
                Your data may be stored on servers located in Ghana and/or other countries where our service providers
                operate. By using our services, you consent to this transfer.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          number: 5,
          title: "Your Rights",
          content: (
            <>
              <p>Depending on your jurisdiction, you may have the following rights:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your data (&quot;right to be forgotten&quot;)</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href="mailto:yaaqworld@gmail.com" className="text-yaaq-gold-ink hover:underline">
                  yaaqworld@gmail.com
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "cookies-tracking",
          number: 6,
          title: "Cookies & Tracking",
          content: (
            <p>
              Our website uses cookies and similar technologies to enhance your experience, analyze traffic, and
              personalize content. See our{" "}
              <a href="/cookies" className="text-yaaq-gold-ink hover:underline">
                Cookie Policy
              </a>{" "}
              for details.
            </p>
          ),
        },
        {
          id: "third-party-links",
          number: 7,
          title: "Third-Party Links",
          content: (
            <p>
              Our website may contain links to third-party websites (social media, YouTube, etc.). We are not
              responsible for the privacy practices of these sites. We encourage you to review their privacy policies.
            </p>
          ),
        },
        {
          id: "childrens-privacy",
          number: 8,
          title: "Children's Privacy",
          content: (
            <p>
              Our services are not directed to individuals under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          ),
        },
        {
          id: "changes-to-this-policy",
          number: 9,
          title: "Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page with an updated &quot;Last updated&quot; date.
            </p>
          ),
        },
      ]}
    />
  );
}
