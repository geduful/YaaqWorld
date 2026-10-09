import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TeamDirectoryClient } from "@/components/team/team-directory-client";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the YAAQ World team — the Executive Board and our Editorial, Creative & Design, Digital & Engagement, and Operations departments.",
  alternates: { canonical: "/team" },
};

export default function TeamPage() {
  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="team-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              The YAAQ World Family
            </Badge>
            <h1
              id="team-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Meet the Creators Behind the Lens
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              A diverse collective of storytellers, producers, creatives, and strategists united by a passion for campus culture.
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="team-directory-heading">
        <div className="container-yaaq">
          <SectionHeader
            id="team-directory-heading"
            tagline="Team Directory"
            title="Our Team Members"
            description="Filter by department to explore the Executive Board and departments powering YAAQ World."
          />
          <TeamDirectoryClient />
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="join-heading">
        <div className="container-yaaq">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader
              id="join-heading"
              tagline="Join Us"
              title="Want to Be Part of the Story?"
              description="We're always looking for passionate creators — photographers, videographers, editors, writers, on-screen talent, and digital strategists. Whether you're a student or a professional, if you love campus culture, there's a place for you."
            />
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                <Button size="lg" variant="gold" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Express Interest
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}