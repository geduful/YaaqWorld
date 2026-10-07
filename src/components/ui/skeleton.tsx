"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-muted",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className,
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number } & Omit<SkeletonProps, "variant">) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "60%" : "100%"}
          height="1rem"
          {...props}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4 p-6", className)} {...props}>
      <Skeleton variant="circular" width="48" height="48" className="mx-auto" />
      <SkeletonText lines={2} width="80%" />
      <Skeleton variant="rectangular" width="100%" height="120" />
      <SkeletonText lines={1} width="40%" />
    </div>
  );
}

export function SkeletonGrid({ count = 6, columns = 3, className, ...props }: { count?: number; columns?: number } & Omit<SkeletonProps, "variant">) {
  return (
    <div
      className={cn(
        "grid gap-6",
        `sm:grid-cols-2 lg:grid-cols-${columns}`,
        className,
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export { Skeleton };