"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  loading?: boolean;
}

export function StatCard({ label, value, icon, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-yaaq-gold/25 bg-yaaq-gold/10 text-yaaq-gold-ink">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
