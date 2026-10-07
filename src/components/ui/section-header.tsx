import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
  tagline?: string;
  id?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  align = "center",
  tagline,
  id,
}: SectionHeaderProps) {
  return (
    <header id={id} className={cn("mb-12", align === "center" ? "text-center" : "", className)}>
      {tagline && (
        <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yaaq-gold bg-yaaq-gold/10 rounded-full">
          {tagline}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-8">{action}</div>
      )}
    </header>
  );
}