"use client";

import * as React from "react";
import { MediaCard } from "@/components/media/media-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { socialIcons } from "@/lib/icons";

const mediaCategories = [
  { id: "all", label: "All Media", icon: socialIcons.grid },
  { id: "campus-tours", label: "Campus Tours", icon: socialIcons.play },
  { id: "src-events", label: "SRC Events", icon: socialIcons.users },
  { id: "awards-pageants", label: "Awards & Pageants", icon: socialIcons.award },
  { id: "street-quizzes", label: "Street Quizzes", icon: socialIcons.helpCircle },
  { id: "behind-scenes", label: "Behind the Scenes", icon: socialIcons.video },
  { id: "photography", label: "Photography", icon: socialIcons.image },
  { id: "video", label: "Video", icon: socialIcons.play },
];

const mockMedia = [
  {
    id: "1",
    title: "KTU SRC Week 2024 — Full Documentary",
    type: "video" as const,
    thumbnail: "/images/media/src-week-thumb.jpg",
    category: "SRC Events",
    duration: "12:34",
    date: "2024-03-20",
  },
  {
    id: "2",
    title: "Face of KTU 2024 Grand Finale",
    type: "image" as const,
    thumbnail: "/images/media/face-of-ktu-thumb.jpg",
    category: "Awards & Pageants",
    date: "2024-02-28",
  },
  {
    id: "3",
    title: "Campus Tour: KTU Main Campus",
    type: "video" as const,
    thumbnail: "/images/media/campus-tour-thumb.jpg",
    category: "Campus Tours",
    duration: "8:15",
    date: "2024-02-10",
  },
  {
    id: "4",
    title: "Street Quiz: Koforidua Edition",
    type: "video" as const,
    thumbnail: "/images/media/street-quiz-thumb.jpg",
    category: "Street Quizzes",
    duration: "5:42",
    date: "2024-01-25",
  },
  {
    id: "5",
    title: "Behind the Scenes: SRC Week Prep",
    type: "video" as const,
    thumbnail: "/images/media/bts-thumb.jpg",
    category: "Behind the Scenes",
    duration: "3:21",
    date: "2024-03-18",
  },
  {
    id: "6",
    title: "Campus Portraits: Student Leaders",
    type: "image" as const,
    thumbnail: "/images/media/portraits-thumb.jpg",
    category: "Photography",
    date: "2024-01-15",
  },
  {
    id: "7",
    title: "KTU Freshers Welcome Concert",
    type: "video" as const,
    thumbnail: "/images/media/freshers-thumb.jpg",
    category: "SRC Events",
    duration: "15:00",
    date: "2023-09-10",
  },
  {
    id: "8",
    title: "Campus Lifestyle: A Day in the Life",
    type: "image" as const,
    thumbnail: "/images/media/lifestyle-thumb.jpg",
    category: "Photography",
    date: "2023-11-05",
  },
];

export function MediaHubClient() {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const filteredMedia = activeCategory === "all"
    ? mockMedia
    : mockMedia.filter((m) => m.category.toLowerCase().replace(" & ", "-").replace(" ", "-") === activeCategory);

  return (
    <>
      <section className="section-py bg-background" aria-labelledby="media-filter-heading">
        <div className="container-yaaq">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-yaaq-gold text-yaaq-navy" : "bg-muted hover:bg-accent"
                )}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <socialIcons.grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-yaaq-gold text-yaaq-navy" : "bg-muted hover:bg-accent"
                )}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <socialIcons.list className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Media categories">
              {mediaCategories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="px-4 py-2 text-sm gap-2">
                  <cat.icon className="h-4 w-4" aria-hidden="true" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {mediaCategories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="animate-in">
                <div
                  className={cn(
                    "grid gap-6",
                    viewMode === "grid"
                      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1",
                  )}
                  role="list"
                  aria-label={`${cat.label} media items`}
                >
                  {filteredMedia.map((item, i) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      className={cn(
                        `animate-in stagger-${i + 1}`,
                        viewMode === "list" && "max-w-2xl"
                      )}
                    />
                  ))}
                  {filteredMedia.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No media in this category yet. Content will be loaded from Supabase.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Media
            </Button>
          </div>
        </div>
      </section>

      <section className="section-py bg-muted/30" aria-labelledby="featured-media-heading">
        <div className="container-yaaq">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                title: "KTU SRC Week 2024 — Full Documentary",
                desc: "Complete coverage of the week-long celebration including concerts, competitions, and the grand finale.",
                type: "video",
                duration: "12:34",
                category: "Featured Documentary",
              },
              {
                title: "Face of KTU: The Journey",
                desc: "An intimate look at the contestants' journey from auditions to the crowning moment.",
                type: "video",
                duration: "22:18",
                category: "Docu-Series",
              },
            ].map((item, i) => (
              <Card key={item.title} className={`overflow-hidden animate-in stagger-${i + 1}`}>
                <div className="relative aspect-[16/9] bg-yaaq-navy">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <socialIcons.play className="h-16 w-16 text-white/50 hover:text-yaaq-gold transition-colors cursor-pointer" />
                  </div>
                  <Badge variant="gold" className="absolute top-4 left-4">{item.category}</Badge>
                  <Badge variant="default" className="absolute bottom-4 right-4">{item.duration}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.desc}</p>
                  <Button variant="outline" className="mt-4 w-full sm:w-auto gap-2">
                    <socialIcons.play className="h-4 w-4" />
                    Watch Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="youtube-heading">
        <div className="container-yaaq text-center">
          <a href="https://youtube.com/@yaaqworld" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="gold" className="gap-2">
              <socialIcons.play className="h-5 w-5" />
              Subscribe on YouTube
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}