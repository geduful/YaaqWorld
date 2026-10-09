"use client";

import * as React from "react";
import { MediaCard } from "@/components/media/media-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { socialIcons } from "@/lib/icons";
import { mediaDisplaySource } from "@/lib/content";
import { categoryLabel, MEDIA_CATEGORY_OPTIONS } from "@/lib/content-categories";
import { Media } from "@/types";

interface MediaHubClientProps {
  items: Media[];
}

export function MediaHubClient({ items }: MediaHubClientProps) {
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selected, setSelected] = React.useState<Media | null>(null);

  const categoryValues = React.useMemo(() => {
    const present = Array.from(new Set(items.map((item) => item.category)));
    const known = MEDIA_CATEGORY_OPTIONS.filter((option) => present.includes(option.value)).map(
      (option) => option.value
    );
    const unknown = present.filter(
      (value) => !MEDIA_CATEGORY_OPTIONS.some((option) => option.value === value)
    );
    return [...known, ...unknown];
  }, [items]);

  const filteredMedia =
    activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory);
  const featuredItems = items.filter((item) => item.featured).slice(0, 2);
  const source = selected ? mediaDisplaySource(selected) : null;

  const toCardItem = (item: Media) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    thumbnail: item.thumbnail_url,
    category: categoryLabel(item.category, MEDIA_CATEGORY_OPTIONS),
    duration: item.duration ?? undefined,
    date: item.published_at ?? item.created_at,
  });

  return (
    <>
      <section className="section-py bg-background" aria-label="Media library">
        <div className="container-yaaq">
          <div className="flex items-center gap-2 mb-8">
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

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                No published media yet
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Photos and videos from our productions will appear here once they are published.
              </p>
            </div>
          ) : (
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="gap-6 mb-8" aria-label="Media categories">
                <TabsTrigger value="all">
                  <socialIcons.grid className="h-4 w-4" aria-hidden="true" />
                  All Media
                </TabsTrigger>
                {categoryValues.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {categoryLabel(value, MEDIA_CATEGORY_OPTIONS)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="animate-in">
                <div
                  className={cn(
                    "grid gap-6",
                    viewMode === "grid"
                      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                  role="list"
                  aria-label="Media items"
                >
                  {filteredMedia.map((item, i) => (
                    <MediaCard
                      key={item.id}
                      item={toCardItem(item)}
                      className={cn(
                        `animate-in stagger-${Math.min(i + 1, 6)}`,
                        viewMode === "list" && "max-w-2xl"
                      )}
                      onClick={() => setSelected(item)}
                    />
                  ))}
                  {filteredMedia.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">
                        No media in this category yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {featuredItems.length > 0 && (
        <section className="section-py bg-muted/30" aria-labelledby="featured-media-heading">
          <div className="container-yaaq">
            <h2
              id="featured-media-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8"
            >
              Featured
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredItems.map((item, i) => (
                <Card key={item.id} className={`overflow-hidden animate-in stagger-${Math.min(i + 1, 10)}`}>
                  <div className="relative aspect-[16/9] bg-yaaq-navy overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <socialIcons.play className="h-16 w-16 text-white/70" aria-hidden="true" />
                    </div>
                    <Badge variant="gold" className="absolute top-4 left-4">
                      {categoryLabel(item.category, MEDIA_CATEGORY_OPTIONS)}
                    </Badge>
                    {item.duration && (
                      <Badge variant="default" className="absolute bottom-4 right-4">
                        {item.duration}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <Button
                      variant="outline"
                      className="mt-4 w-full sm:w-auto gap-2"
                      onClick={() => setSelected(item)}
                    >
                      <socialIcons.play className="h-4 w-4" />
                      {item.type === "video" ? "Watch Now" : "View"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-py bg-yaaq-navy text-white" aria-label="YouTube channel">
        <div className="container-yaaq text-center">
          <Button asChild size="lg" variant="gold" className="gap-2">
            <a href="https://youtube.com/@yaaqworld" target="_blank" rel="noopener noreferrer">
              <socialIcons.youtube className="h-5 w-5" />
              Subscribe on YouTube
            </a>
          </Button>
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.title ?? ""}</DialogTitle>
            {selected?.description && (
              <DialogDescription>{selected.description}</DialogDescription>
            )}
          </DialogHeader>
          {selected && source?.src && (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              {source.kind === "youtube" || source.kind === "vimeo" ? (
                <iframe
                  src={source.src}
                  title={selected.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : source.kind === "file" ? (
                <video src={source.src} controls className="h-full w-full" />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={source.src} alt={selected.title} className="h-full w-full object-contain" />
              )}
            </div>
          )}
          {selected && !source?.src && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              This item&apos;s media file is no longer available.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
