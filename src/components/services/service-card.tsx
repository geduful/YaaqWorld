"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id?: string;
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  image?: string;
  category?: string;
  featured?: boolean;
  ctaLabel?: string;
  className?: string;
}

export function ServiceCard({
  id,
  title,
  description,
  href,
  icon,
  image,
  category,
  featured = false,
  ctaLabel,
  className,
}: ServiceCardProps) {
  return (
    <Card id={id} className={cn("group overflow-hidden transition-all duration-300 hover:shadow-xl scroll-mt-24", featured && "lg:col-span-2", className)}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {category && (
            <Badge variant="gold" className="absolute top-4 left-4">
              {category}
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-6">
        {icon && !image && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold-ink">
            {icon}
          </div>
        )}
        {category && !image && (
          <Badge variant="gold" className="mb-3 inline-block">
            {category}
          </Badge>
        )}
        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-yaaq-gold-ink transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-yaaq-gold-ink hover:gap-3 transition-all"
        >
          {ctaLabel ?? "Book This Service"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}