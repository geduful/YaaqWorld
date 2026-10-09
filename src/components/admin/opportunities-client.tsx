"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { isSafeTextInputUrl, safeHttpUrl } from "@/lib/content";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatorOpportunity, OpportunityApplication } from "@/types";
import { Eye, Pencil, Plus, Trash2, Users } from "lucide-react";

interface OpportunitiesClientProps {
  canManage: boolean;
}

interface ApplicationRow extends OpportunityApplication {
  applicant: { full_name: string | null; avatar_url: string | null } | null;
}

interface OpportunityFormState {
  title: string;
  type: "casting" | "crew" | "production" | "other";
  description: string;
  requirements: string;
  location: string;
  compensation: string;
  deadline: string;
  applyUrl: string;
  status: "draft" | "open" | "closed" | "archived";
  published: boolean;
}

const EMPTY_FORM: OpportunityFormState = {
  title: "",
  type: "casting",
  description: "",
  requirements: "",
  location: "",
  compensation: "",
  deadline: "",
  applyUrl: "",
  status: "draft",
  published: false,
};

const TYPE_LABELS: Record<OpportunityFormState["type"], string> = {
  casting: "Casting",
  crew: "Crew",
  production: "Production",
  other: "Other",
};

const APPLICATION_STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
] as const;

export function OpportunitiesClient({ canManage }: OpportunitiesClientProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CreatorOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreatorOpportunity | null>(null);
  const [form, setForm] = useState<OpportunityFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreatorOpportunity | null>(null);
  const [applicationsFor, setApplicationsFor] = useState<CreatorOpportunity | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [appSaving, setAppSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setItems((data ?? []) as CreatorOpportunity[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchItems();
      setLoading(false);
    };
    run();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (item: CreatorOpportunity) => {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      description: item.description,
      requirements: item.requirements ?? "",
      location: item.location ?? "",
      compensation: item.compensation ?? "",
      deadline: item.deadline ?? "",
      applyUrl: item.apply_url ?? "",
      status: item.status,
      published: item.published_at !== null,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (form.applyUrl.trim() && !isSafeTextInputUrl(form.applyUrl)) {
      setFormError("External apply link must start with https://");
      return;
    }

    setSaving(true);
    setFormError(null);
    const supabase = getBrowserClient();

    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      requirements: form.requirements.trim() || null,
      location: form.location.trim() || null,
      compensation: form.compensation.trim() || null,
      deadline: form.deadline || null,
      apply_url: form.applyUrl.trim() || null,
      status: form.status,
      published_at: form.published
        ? editing?.published_at ?? new Date().toISOString()
        : null,
    };

    try {
      if (editing) {
        const { error: updateError } = await supabase
          .from("opportunities")
          .update(payload)
          .eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("opportunities")
          .insert({ ...payload, created_by: user?.id ?? null });
        if (insertError) throw insertError;
      }
      await fetchItems();
      setFormOpen(false);
    } catch (err) {
      setFormError(getDbErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: CreatorOpportunity) => {
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase
      .from("opportunities")
      .update({
        published_at: item.published_at === null ? new Date().toISOString() : null,
      })
      .eq("id", item.id);

    if (updateError) {
      setError(getDbErrorMessage(updateError));
    } else {
      await fetchItems();
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      setItems((current) => current.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  const openApplications = async (item: CreatorOpportunity) => {
    setApplicationsFor(item);
    setApplications([]);
    setApplicationsError(null);
    setApplicationsLoading(true);
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("opportunity_applications")
      .select("*, applicant:profiles(full_name, avatar_url)")
      .eq("opportunity_id", item.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setApplicationsError(getDbErrorMessage(queryError));
    } else {
      setApplications((data ?? []) as unknown as ApplicationRow[]);
    }
    setApplicationsLoading(false);
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    setAppSaving(true);
    setApplicationsError(null);
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase
      .from("opportunity_applications")
      .update({ status: status as OpportunityApplication["status"] })
      .eq("id", applicationId);

    if (updateError) {
      setApplicationsError(getDbErrorMessage(updateError));
    } else {
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: status as OpportunityApplication["status"] }
            : application
        )
      );
    }
    setAppSaving(false);
  };

  const removeApplication = async (applicationId: string) => {
    setAppSaving(true);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("opportunity_applications")
      .delete()
      .eq("id", applicationId);

    if (deleteError) {
      setApplicationsError(getDbErrorMessage(deleteError));
    } else {
      setApplications((current) => current.filter((a) => a.id !== applicationId));
    }
    setAppSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Publish casting calls, crew recruitment, and production roles for creators."
        actions={
          canManage && (
            <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Opportunity
            </Button>
          )
        }
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No opportunities yet"
          description="Publish an open call to notify creators and start collecting applications."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Opportunity
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">Opportunity</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Deadline</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.location || "No location"}
                        {item.published_at === null && " · Not public"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{TYPE_LABELS[item.type]}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="opportunity" status={item.status} />
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openApplications(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Applications
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublished(item)}
                          >
                            {item.published_at ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !saving && setFormOpen(open)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit opportunity" : "New opportunity"}</DialogTitle>
            <DialogDescription>
              Publishing an open opportunity notifies every creator on the platform.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opp-title">Title *</Label>
              <Input
                id="opp-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Camera Operator for Campus Documentary"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({ ...form, type: value as OpportunityFormState["type"] })
                  }
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casting">Casting</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm({ ...form, status: value as OpportunityFormState["status"] })
                  }
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opp-description">Description *</Label>
              <Textarea
                id="opp-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opp-requirements">Requirements</Label>
              <Textarea
                id="opp-requirements"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opp-location">Location</Label>
                <Input
                  id="opp-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Koforidua / Remote"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp-compensation">Compensation</Label>
                <Input
                  id="opp-compensation"
                  value={form.compensation}
                  onChange={(e) => setForm({ ...form, compensation: e.target.value })}
                  placeholder="GHS 800 / day"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opp-deadline">Application deadline</Label>
                <Input
                  id="opp-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp-apply-url">External apply link (https)</Label>
                <Input
                  id="opp-apply-url"
                  value={form.applyUrl}
                  onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                  placeholder="https://… (optional)"
                  disabled={saving}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
              />
              <span className="text-sm font-medium">Public on the creator portal</span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={save} isLoading={saving}>
              {editing ? "Save changes" : "Create opportunity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={applicationsFor !== null}
        onOpenChange={(open) => !open && setApplicationsFor(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applications</DialogTitle>
            <DialogDescription>{applicationsFor?.title ?? ""}</DialogDescription>
          </DialogHeader>

          {applicationsError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {applicationsError}
            </div>
          )}

          {applicationsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No applications yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {applications.map((application) => (
                <li
                  key={application.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {application.applicant?.full_name ?? "Creator"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(application.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <StatusBadge kind="application" status={application.status} />
                  </div>
                  {application.cover_note && (
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {application.cover_note}
                    </p>
                  )}
                  {safeHttpUrl(application.portfolio_url) && (
                    <a
                      href={safeHttpUrl(application.portfolio_url) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yaaq-gold-ink underline break-all"
                    >
                      Portfolio link
                    </a>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={application.status}
                      onValueChange={(value) => updateApplicationStatus(application.id, value)}
                      disabled={appSaving}
                    >
                      <SelectTrigger className="w-40" aria-label="Application status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => removeApplication(application.id)}
                      disabled={appSaving}
                      aria-label="Delete application"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationsFor(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete opportunity?"
        description={`"${deleteTarget?.title ?? ""}" and its applications will be removed permanently.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
