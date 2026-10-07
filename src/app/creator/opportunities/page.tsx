"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Bell } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";

export default function CreatorOpportunitiesPage() {
  const { loading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserClient();

    const fetchOpportunities = async () => {
      setIsLoading(true);
      // Opportunities table will be populated via Admin CMS (Phase 3)
      await supabase.from("opportunities").select("id").limit(1);
      setIsLoading(false);
    };

    fetchOpportunities();
  }, [user]);

  if (loading) {
    return (
      <DashboardShell variant="creator">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell variant="creator">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-1 text-muted-foreground">
            Casting calls, crew recruitment, and production opportunities from YAAQ World
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Open Calls", value: "0" },
            { label: "Crew Notices", value: "0" },
            { label: "Closing Soon", value: "0" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="py-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No open opportunities right now"
                description="Casting calls, crew recruitment notices, and production opportunities will be published here by the YAAQ World team. Check back soon."
                action={
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Bell className="h-4 w-4" />
                    <span>You&apos;ll be notified when new opportunities are posted</span>
                  </div>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
