"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
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
import { Announcement, AnnouncementAudience } from "@/types";
import { Megaphone, Plus, Send, Trash2 } from "lucide-react";

interface AnnouncementsClientProps {
  canManage: boolean;
}

const AUDIENCES: { value: AnnouncementAudience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "members", label: "Members only" },
  { value: "creators", label: "Creators only" },
];

export function AnnouncementsClient({ canManage }: AnnouncementsClientProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" as AnnouncementAudience });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setAnnouncements((data ?? []) as Announcement[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchAnnouncements();
      setLoading(false);
    };
    run();
  }, [fetchAnnouncements]);

  const saveDraft = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setFormError("Title and message are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const supabase = getBrowserClient();

    const { error: insertError } = await supabase.from("announcements").insert({
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
      status: "draft",
      created_by: user?.id ?? null,
    });

    if (insertError) {
      setFormError(getDbErrorMessage(insertError));
    } else {
      await fetchAnnouncements();
      setFormOpen(false);
      setForm({ title: "", message: "", audience: "all" });
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!publishTarget) return;
    setSaving(true);
    setActionError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("publish_announcement", {
      p_announcement_id: publishTarget.id,
    });

    if (rpcError) {
      setActionError(getDbErrorMessage(rpcError));
    } else {
      setPublishTarget(null);
      await fetchAnnouncements();
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setActionError(null);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setActionError(getDbErrorMessage(deleteError));
    } else {
      setAnnouncements((current) => current.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Compose announcements and publish them as member notifications."
        actions={
          canManage && (
            <Button
              variant="gold"
              size="sm"
              className="gap-2"
              onClick={() => {
                setFormError(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          )
        }
      />

      {(error || actionError) && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {actionError ?? error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements yet"
          description="Draft an announcement and publish it to notify members."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{announcement.title}</p>
                    <StatusBadge kind="announcement" status={announcement.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                    {announcement.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Audience: <span className="capitalize">{announcement.audience}</span>
                    {announcement.status === "published" && (
                      <>
                        {" · "}
                        {announcement.recipient_count} recipient
                        {announcement.recipient_count === 1 ? "" : "s"}
                        {" · "}
                        {new Date(announcement.published_at ?? announcement.created_at).toLocaleDateString("en-GH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-2">
                    {announcement.status === "draft" && (
                      <Button
                        variant="gold"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setPublishTarget(announcement)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                    {announcement.status === "draft" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setDeleteTarget(announcement)}
                        aria-label={`Delete ${announcement.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !saving && setFormOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>
              Saved as a draft. You can publish it once you are ready.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title *</Label>
              <Input
                id="announcement-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-message">Message *</Label>
              <Textarea
                id="announcement-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What would you like to share?"
                rows={5}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={form.audience}
                onValueChange={(value) =>
                  setForm({ ...form, audience: value as AnnouncementAudience })
                }
                disabled={saving}
              >
                <SelectTrigger aria-label="Audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={saveDraft} isLoading={saving}>
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={publishTarget !== null}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title="Publish announcement?"
        description={`"${publishTarget?.title ?? ""}" will be sent as a notification to the selected audience. This cannot be undone.`}
        confirmLabel="Publish"
        isLoading={saving}
        onConfirm={publish}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete draft?"
        description={`"${deleteTarget?.title ?? ""}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
