import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { MediaHubClient } from "@/components/media/media-hub-client";
import { getPublishedMedia } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Hub",
  description:
    "Explore YAAQ World's media hub — campus tours, SRC events, awards & pageants, street quizzes, behind the scenes, photography, and video content from Ghanaian campus culture.",
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const items = await getPublishedMedia();

  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="media-hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-20">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-6 inline-block">
              Media Hub
            </Badge>
            <h1
              id="media-hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              Explore Our Visual Stories
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              A curated collection of our photography, videography, and storytelling from across Ghanaian campuses.
            </p>
          </div>
        </div>
      </section>

      <MediaHubClient items={items} />
    </MainLayout>
  );
}
