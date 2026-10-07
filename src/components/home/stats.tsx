"use client";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number | null;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
}

interface StatsProps {
  stats: StatItem[];
  className?: string;
}

export function Stats({ stats, className }: StatsProps) {
  return (
    <div
      className={cn(
        "grid gap-8 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      role="list"
      aria-label="Key statistics"
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "text-center animate-in stagger-{}".replace("{}", String(index + 1)),
          )}
          role="listitem"
        >
          {stat.icon && (
            <div className="mb-3 flex justify-center text-yaaq-gold">
              {stat.icon}
            </div>
          )}
          <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {stat.value !== null && stat.value !== undefined ? (
              <>
                {stat.prefix}
                {formatNumber(stat.value)}
                {stat.suffix}
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}