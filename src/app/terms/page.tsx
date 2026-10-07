import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "YAAQ World's terms of use — the terms and conditions governing your use of our website and services.",
};

export default function TermsPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="terms-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <h1 id="terms-heading" className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Terms of Use
            </h1>
            <p className="mt-4 text-white/70">Last updated: {new Date().toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="terms-content">
        <div className="container-yaaq max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="lead text-muted-foreground">
              These Terms of Use ("Terms") govern your access to and use of the YAAQ World website ("Website") and our media production services ("Services"). By accessing or using our Website or Services, you agree to be bound by these Terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using our Website or booking our Services, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use our Website or Services.</p>

            <h2>2. Services Description</h2>
            <p>YAAQ World provides professional media production services including but not limited to: event coverage, photography, videography, brand activations, campus campaigns, media partnerships, and creative consulting. Specific deliverables, timelines, and costs are outlined in individual project proposals and agreements.</p>

            <h2>3. Booking & Agreements</h2>
            <ul>
              <li>Booking requests submitted through our website constitute an inquiry, not a confirmed booking.</li>
              <li>A binding agreement is formed only upon mutual acceptance of a formal proposal and payment of any required deposit.</li>
              <li>We reserve the right to decline any booking request at our discretion.</li>
              <li>Event dates are secured only upon receipt of signed agreement and deposit.</li>
            </ul>

            <h2>4. Payment Terms</h2>
            <ul>
              <li>A deposit (typically 50%) is required to confirm bookings.</li>
              <li>Final payment is due on or before the event date unless otherwise agreed.</li>
              <li>Payments can be made via bank transfer, mobile money, or other agreed methods.</li>
              <li>Late payments may incur additional charges as specified in the agreement.</li>
            </ul>

            <h2>5. Cancellations & Rescheduling</h2>
            <ul>
              <li>Cancellations more than 30 days before the event: deposit refunded minus administrative fees.</li>
              <li>Cancellations 14-30 days before: 50% of total fee retained.</li>
              <li>Cancellations less than 14 days before: 100% of total fee retained.</li>
              <li>Rescheduling is subject to availability and may incur additional fees.</li>
              <li>Force majeure events (natural disasters, government restrictions, etc.) will be handled case by case.</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <ul>
              <li>All content produced by YAAQ World (photos, videos, graphics, etc.) remains our intellectual property until full payment is received.</li>
              <li>Upon full payment, clients receive a license to use deliverables for the agreed purposes.</li>
              <li>YAAQ World retains the right to use produced content for our portfolio, marketing, and promotional purposes unless otherwise agreed in writing.</li>
              <li>Raw footage and unedited files are not included unless specifically agreed.</li>
            </ul>

            <h2>7. Client Responsibilities</h2>
            <ul>
              <li>Provide accurate event information, schedules, and access requirements.</li>
              <li>Obtain necessary permissions for filming/photography at venues.</li>
              <li>Ensure attendees are aware of filming/photography where required.</li>
              <li>Provide a safe working environment for our crew.</li>
              <li>Designate a point of contact for the event day.</li>
            </ul>

            <h2>8. Limitation of Liability</h2>
            <p>YAAQ World's total liability for any claim arising from our Services shall not exceed the total fees paid for that project. We are not liable for indirect, incidental, or consequential damages. We are not responsible for equipment failure, weather, venue restrictions, or circumstances beyond our reasonable control.</p>

            <h2>9. Indemnification</h2>
            <p>You agree to indemnify and hold YAAQ World harmless from any claims, damages, or expenses arising from your use of our Services, your breach of these Terms, or any third-party claims related to your event or content.</p>

            <h2>10. Website Use</h2>
            <ul>
              <li>You may not use our Website for any unlawful or prohibited purpose.</li>
              <li>You may not attempt to gain unauthorized access to any part of our systems.</li>
              <li>You may not scrape, crawl, or extract content from our Website without permission.</li>
              <li>We reserve the right to modify or discontinue the Website at any time.</li>
            </ul>

            <h2>11. Governing Law</h2>
            <p>These Terms are governed by the laws of Ghana. Any disputes shall be resolved in the courts of Koforidua, Ghana.</p>

            <h2>12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of our Website or Services after changes constitutes acceptance of the new Terms.</p>

            <h2>13. Contact</h2>
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