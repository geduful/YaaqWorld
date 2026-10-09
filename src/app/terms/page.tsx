import { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "YAAQ World's terms of use — the terms and conditions governing your use of our website and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={
        <>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of the YAAQ World website
          (&quot;Website&quot;) and our media production services (&quot;Services&quot;). By accessing or using our
          Website or Services, you agree to be bound by these Terms.
        </>
      }
      sections={[
        {
          id: "acceptance-of-terms",
          number: 1,
          title: "Acceptance of Terms",
          content: (
            <p>
              By using our Website or booking our Services, you confirm that you have read, understood, and agree to
              these Terms. If you do not agree, please do not use our Website or Services.
            </p>
          ),
        },
        {
          id: "services-description",
          number: 2,
          title: "Services Description",
          content: (
            <p>
              YAAQ World provides professional media production services including but not limited to: event coverage,
              photography, videography, brand activations, campus campaigns, media partnerships, and creative
              consulting. Specific deliverables, timelines, and costs are outlined in individual project proposals and
              agreements.
            </p>
          ),
        },
        {
          id: "booking-agreements",
          number: 3,
          title: "Booking & Agreements",
          content: (
            <ul>
              <li>Booking requests submitted through our website constitute an inquiry, not a confirmed booking.</li>
              <li>
                A binding agreement is formed only upon mutual acceptance of a formal proposal and payment of any
                required deposit.
              </li>
              <li>We reserve the right to decline any booking request at our discretion.</li>
              <li>Event dates are secured only upon receipt of signed agreement and deposit.</li>
            </ul>
          ),
        },
        {
          id: "payment-terms",
          number: 4,
          title: "Payment Terms",
          content: (
            <ul>
              <li>A deposit (typically 50%) is required to confirm bookings.</li>
              <li>Final payment is due on or before the event date unless otherwise agreed.</li>
              <li>Payments can be made via bank transfer, mobile money, or other agreed methods.</li>
              <li>Late payments may incur additional charges as specified in the agreement.</li>
            </ul>
          ),
        },
        {
          id: "cancellations-rescheduling",
          number: 5,
          title: "Cancellations & Rescheduling",
          content: (
            <ul>
              <li>Cancellations more than 30 days before the event: deposit refunded minus administrative fees.</li>
              <li>Cancellations 14-30 days before: 50% of total fee retained.</li>
              <li>Cancellations less than 14 days before: 100% of total fee retained.</li>
              <li>Rescheduling is subject to availability and may incur additional fees.</li>
              <li>Force majeure events (natural disasters, government restrictions, etc.) will be handled case by case.</li>
            </ul>
          ),
        },
        {
          id: "intellectual-property",
          number: 6,
          title: "Intellectual Property",
          content: (
            <ul>
              <li>
                All content produced by YAAQ World (photos, videos, graphics, etc.) remains our intellectual property
                until full payment is received.
              </li>
              <li>Upon full payment, clients receive a license to use deliverables for the agreed purposes.</li>
              <li>
                YAAQ World retains the right to use produced content for our portfolio, marketing, and promotional
                purposes unless otherwise agreed in writing.
              </li>
              <li>Raw footage and unedited files are not included unless specifically agreed.</li>
            </ul>
          ),
        },
        {
          id: "client-responsibilities",
          number: 7,
          title: "Client Responsibilities",
          content: (
            <ul>
              <li>Provide accurate event information, schedules, and access requirements.</li>
              <li>Obtain necessary permissions for filming/photography at venues.</li>
              <li>Ensure attendees are aware of filming/photography where required.</li>
              <li>Provide a safe working environment for our crew.</li>
              <li>Designate a point of contact for the event day.</li>
            </ul>
          ),
        },
        {
          id: "limitation-of-liability",
          number: 8,
          title: "Limitation of Liability",
          content: (
            <p>
              YAAQ World&apos;s total liability for any claim arising from our Services shall not exceed the total fees
              paid for that project. We are not liable for indirect, incidental, or consequential damages. We are not
              responsible for equipment failure, weather, venue restrictions, or circumstances beyond our reasonable
              control.
            </p>
          ),
        },
        {
          id: "indemnification",
          number: 9,
          title: "Indemnification",
          content: (
            <p>
              You agree to indemnify and hold YAAQ World harmless from any claims, damages, or expenses arising from
              your use of our Services, your breach of these Terms, or any third-party claims related to your event or
              content.
            </p>
          ),
        },
        {
          id: "website-use",
          number: 10,
          title: "Website Use",
          content: (
            <ul>
              <li>You may not use our Website for any unlawful or prohibited purpose.</li>
              <li>You may not attempt to gain unauthorized access to any part of our systems.</li>
              <li>You may not scrape, crawl, or extract content from our Website without permission.</li>
              <li>We reserve the right to modify or discontinue the Website at any time.</li>
            </ul>
          ),
        },
        {
          id: "governing-law",
          number: 11,
          title: "Governing Law",
          content: (
            <p>
              These Terms are governed by the laws of Ghana. Any disputes shall be resolved in the courts of Koforidua,
              Ghana.
            </p>
          ),
        },
        {
          id: "changes-to-terms",
          number: 12,
          title: "Changes to Terms",
          content: (
            <p>
              We may update these Terms from time to time. Continued use of our Website or Services after changes
              constitutes acceptance of the new Terms.
            </p>
          ),
        },
      ]}
    />
  );
}
