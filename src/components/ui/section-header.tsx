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
  /** "sm" suits sub-sections (mission/vision, panels) vs full page sections. */
  size?: "default" | "sm";
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  align = "center",
  tagline,
  id,
  size = "default",
}: SectionHeaderProps) {
  return (
    <header id={id} className={cn("mb-10 lg:mb-12", align === "center" ? "text-center" : "", className)}>
      {tagline && <p className="eyebrow mb-3">{tagline}</p>}
      <h2
        className={cn(
          "font-display font-bold leading-tight text-balance text-[var(--section-fg)]",
          size === "default"
            ? "text-2xl sm:text-3xl lg:text-4xl"
            : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <div
          className={cn(
            "mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--section-fg-muted)]",
            align === "center" ? "mx-auto" : "",
          )}
        >
          {description}
        </div>
      )}
      {action && <div className="mt-8">{action}</div>}
    </header>
  );
}
