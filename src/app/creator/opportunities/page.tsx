"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { isSafeTextInputUrl } from "@/lib/content";
import { Briefcase, Bell, MapPin, CalendarDays, CheckCircle2, Trash2 } from "lucide-react";
import { CreatorOpportunity, OpportunityApplication } from "@/types";

const TYPE_LABELS: Record<CreatorOpportunity["type"], string> = {
  casting: "Casting",
  crew: "Crew",
  production: "Production",
  other: "Other",
};

export default function CreatorOpportunitiesPage() {
  const { loading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<CreatorOpportunity[]>([]);
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);
  const [closingSoonCount, setClosingSoonCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<CreatorOpportunity | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const supabase = getBrowserClient();
    const today = new Date().toISOString().slice(0, 10);

    const [opportunitiesResult, applicationsResult] = await Promise.all([
      supabase
        .from("opportunities")
        .select("*")
        .eq("status", "open")
        .not("published_at", "is", null)
        .lte("published_at", new Date().toISOString())
        .or(`deadline.is.null,deadline.gte.${today}`)
        .order("deadline", { ascending: true, nullsFirst: false })
        .order("published_at", { ascending: false })
        .limit(100),
      supabase
        .from("opportunity_applications")
        .select("*")
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    if (opportunitiesResult.error) {
      setError(getDbErrorMessage(opportunitiesResult.error));
    } else {
      const rows = (opportunitiesResult.data ?? []) as CreatorOpportunity[];
      const now = Date.now();
      setClosingSoonCount(
        rows.filter((opportunity) => {
          if (!opportunity.deadline) return false;
          const days =
            (new Date(opportunity.deadline).getTime() - now) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 7;
        }).length
      );
      setOpportunities(rows);
      setError(null);
    }
    if (!applicationsResult.error) {
      setApplications((applicationsResult.data ?? []) as OpportunityApplication[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };
    run();
  }, [fetchData]);

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

  if (!user) {
    redirect("/auth/login?redirect=%2Fcreator%2Fopportunities");
  }

  const applicationFor = (opportunityId: string) =>
    applications.find((application) => application.opportunity_id === opportunityId) ?? null;

  const openApply = (opportunity: CreatorOpportunity) => {
    setApplyingTo(opportunity);
    setCoverNote("");
    setPortfolioUrl("");
    setFormError(null);
    setSubmitSuccess(false);
  };

  const submitApplication = async () => {
    if (!applyingTo || !user) return;
    if (portfolioUrl.trim() && !isSafeTextInputUrl(portfolioUrl)) {
      setFormError("Portfolio link must start with https://");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const supabase = getBrowserClient();
    const { error: insertError } = await supabase.from("opportunity_applications").insert({
      opportunity_id: applyingTo.id,
      applicant_id: user.id,
      cover_note: coverNote.trim() || null,
      portfolio_url: portfolioUrl.trim() || null,
      status: "submitted",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setFormError("You have already applied to this opportunity.");
      } else {
        setFormError(getDbErrorMessage(insertError));
      }
    } else {
      setSubmitSuccess(true);
      await fetchData();
    }
    setSubmitting(false);
  };

  const withdraw = async (application: OpportunityApplication) => {
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("opportunity_applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      setApplications((current) => current.filter((a) => a.id !== application.id));
    }
  };

  return (
    <DashboardShell variant="creator">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-1 text-muted-foreground">
            Casting calls, crew recruitment, and production opportunities from YAAQ World
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Open Calls", value: String(opportunities.length) },
            { label: "Crew Notices", value: String(opportunities.filter((o) => o.type === "crew").length) },
            { label: "Closing Soon", value: String(closingSoonCount) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <Card>
            <CardContent className="py-4">
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
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {opportunities.map((opportunity) => {
              const application = applicationFor(opportunity.id);
              return (
                <li key={opportunity.id}>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-lg font-semibold text-foreground">
                              {opportunity.title}
                            </h2>
                            <Badge variant="outline">{TYPE_LABELS[opportunity.type]}</Badge>
                            {application && (
                              <Badge variant="gold" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Applied
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {opportunity.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" aria-hidden="true" />
                                {opportunity.location}
                              </span>
                            )}
                            {opportunity.deadline && (
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                Closes {new Date(opportunity.deadline).toLocaleDateString()}
                              </span>
                            )}
                            {opportunity.compensation && (
                              <span>{opportunity.compensation}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {opportunity.description}
                      </p>
                      {opportunity.requirements && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Requirements</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {opportunity.requirements}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {application ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => withdraw(application)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Withdraw application
                          </Button>
                        ) : (
                          <Button variant="gold" size="sm" onClick={() => openApply(opportunity)}>
                            Apply
                          </Button>
                        )}
                        {opportunity.apply_url && (
                          <a
                            href={opportunity.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              Apply externally
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={applyingTo !== null}
        onOpenChange={(open) => !submitting && !open && setApplyingTo(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply: {applyingTo?.title ?? ""}</DialogTitle>
            <DialogDescription>
              Introduce yourself to the YAAQ World team. A portfolio link is optional but
              recommended.
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400" role="alert">
              <p className="font-medium">Application submitted.</p>
              <p className="text-sm mt-1">
                The team will review it and reach out if you&apos;re a fit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="apply-cover">Cover note</Label>
                <Textarea
                  id="apply-cover"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={5}
                  placeholder="Why are you a great fit for this opportunity?"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apply-portfolio">Portfolio link (https)</Label>
                <Input
                  id="apply-portfolio"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://…"
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyingTo(null)} disabled={submitting}>
              {submitSuccess ? "Close" : "Cancel"}
            </Button>
            {!submitSuccess && (
              <Button variant="gold" onClick={submitApplication} isLoading={submitting}>
                Submit application
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
