"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  image?: string;
  category?: string;
  featured?: boolean;
  className?: string;
}

export function ServiceCard({
  title,
  description,
  href,
  icon,
  image,
  category,
  featured = false,
  className,
}: ServiceCardProps) {
  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-xl", featured && "lg:col-span-2", className)}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold">
            {icon}
          </div>
        )}
        {category && !image && (
          <Badge variant="gold" className="mb-3 inline-block">
            {category}
          </Badge>
        )}
        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-yaaq-gold transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-yaaq-gold hover:gap-3 transition-all"
        >
          Book This Service
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}