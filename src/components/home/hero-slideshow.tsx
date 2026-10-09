import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_IMAGE_PATTERN = /^hero.*\.(?:avif|jpe?g|png|webp)$/i;
const SECONDS_PER_IMAGE = 6;

export function getHeroSlides(): string[] {
  try {
    const dir = path.join(process.cwd(), "public");
    return fs
      .readdirSync(dir)
      .filter((file) => HERO_IMAGE_PATTERN.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => `/${file}`);
  } catch {
    return [];
  }
}

interface HeroSlideshowProps {
  slides: string[];
  className?: string;
}

export function HeroSlideshow({ slides, className }: HeroSlideshowProps) {
  if (slides.length === 0) return null;

  const duration = slides.length >= 2 ? slides.length * SECONDS_PER_IMAGE : 0;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-yaaq-navy", className)}
      aria-hidden="true"
    >
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            duration > 0 && "hero-slide",
          )}
          style={
            duration > 0
              ? { animationDuration: `${duration}s`, animationDelay: `${i * SECONDS_PER_IMAGE}s` }
              : undefined
          }
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-yaaq-navy via-yaaq-navy/70 to-yaaq-navy/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-yaaq-navy/90 via-transparent to-yaaq-navy/50" />
    </div>
  );
}
