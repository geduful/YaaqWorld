"use client";

import * as React from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VideoHeroProps {
  src?: string;
  poster?: string;
  fallback?: ReactNode;
  className?: string;
}

export function VideoHero({ src, poster, fallback, className }: VideoHeroProps) {
  const [hasError, setHasError] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const shouldPlayVideo = src && !hasError && !prefersReducedMotion;

  return (
    <div className={cn("relative overflow-hidden bg-yaaq-navy", className)} aria-hidden="true">
      {shouldPlayVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onError={() => setHasError(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-yaaq-navy"
          style={poster ? { backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {fallback}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-yaaq-navy via-yaaq-navy/70 to-yaaq-navy/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-yaaq-navy/90 via-transparent to-yaaq-navy/50" />
    </div>
  );
}