"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video";
  thumbnail: string;
  category: string;
  duration?: string;
  date: string;
}

interface MediaCardProps {
  item: MediaItem;
  className?: string;
  onClick?: () => void;
}

export function MediaCard({ item, className, onClick }: MediaCardProps) {
  const isVideo = item.type === "video";

  return (
    <Card className={cn("group overflow-hidden cursor-pointer", className)} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-yaaq-navy shadow-lg hover:bg-white transition-colors"
              onClick={(e) => { e.stopPropagation(); onClick?.(); }}
              aria-label={`Play video: ${item.title}`}
            >
              <Play className="h-6 w-6 ml-1" />
            </button>
          </div>
        )}
        <Badge variant="gold" className="absolute top-3 left-3">
          {item.category}
        </Badge>
        {item.duration && (
          <Badge variant="default" className="absolute bottom-3 right-3">
            {item.duration}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <p className="font-display text-base font-semibold text-foreground line-clamp-1">{item.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.date)}</p>
      </div>
    </Card>
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}