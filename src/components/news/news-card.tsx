"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NewsArticle {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  publishedAt: string;
  readTime?: number;
  featured?: boolean;
}

interface NewsCardProps {
  article: NewsArticle;
  className?: string;
}

export function NewsCard({ article, className }: NewsCardProps) {
  return (
    <Card className={cn("group overflow-hidden flex flex-col h-full", article.featured && "lg:col-span-2 lg:row-span-2", className)}>
      {article.image && (
        <Link href={`/news/${article.slug}`} className="relative aspect-[16/9] overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <Badge variant="gold" className="absolute top-4 left-4">
            {article.category}
          </Badge>
        </Link>
      )}
      <CardContent className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={article.publishedAt}>
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </time>
          {article.readTime && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                <Clock className="h-3.5 w-3.5 shrink-0 inline-baseline" aria-hidden="true" />
                {article.readTime} min read
              </span>
            </>
          )}
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold text-foreground group-hover:text-yaaq-gold transition-colors line-clamp-2">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
        <Link
          href={`/news/${article.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-yaaq-gold hover:gap-3 transition-all"
        >
          Read More
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}