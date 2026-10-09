"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { deleteCmsImageByUrl, isCmsImageUrl, uploadCmsImage } from "@/lib/cms-media";
import { extractVimeoId, extractYouTubeId } from "@/lib/content";
import { MEDIA_CATEGORY_OPTIONS, categoryLabel } from "@/lib/content-categories";
import { PageHeader } from "@/components/admin/page-header";
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
import { Media } from "@/types";
import { CheckCircle2, Film, Pencil, Plus, Trash2, Upload, XCircle } from "lucide-react";

interface MediaClientProps {
  canManage: boolean;
}

interface MediaFormState {
  title: string;
  type: "image" | "video";
  category: string;
  description: string;
  tagsInput: string;
  duration: string;
  youtubeInput: string;
  vimeoInput: string;
  mediaUrl: string;
  thumbnailUrl: string;
  featured: boolean;
  published: boolean;
}

const EMPTY_FORM: MediaFormState = {
  title: "",
  type: "image",
  category: "general",
  description: "",
  tagsInput: "",
  duration: "",
  youtubeInput: "",
  vimeoInput: "",
  mediaUrl: "",
  thumbnailUrl: "",
  featured: false,
  published: false,
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function MediaClient({ canManage }: MediaClientProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);
  const [form, setForm] = useState<MediaFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);

  const fetchItems = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("media_items")
      .select("*")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setItems((data ?? []) as Media[]);
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

  const openEdit = (item: Media) => {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      category: item.category,
      description: item.description ?? "",
      tagsInput: item.tags.join(", "),
      duration: item.duration ?? "",
      youtubeInput: item.youtube_id ?? "",
      vimeoInput: item.vimeo_id ?? "",
      mediaUrl: item.media_url ?? "",
      thumbnailUrl: item.thumbnail_url,
      featured: item.featured,
      published: item.published_at !== null,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploading(true);
    setFormError(null);
    try {
      const url = await uploadCmsImage(file, user.id);
      setForm((current) => ({ ...current, thumbnailUrl: url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!form.thumbnailUrl.trim()) {
      setFormError("A thumbnail image is required.");
      return;
    }

    const youtubeId = form.type === "video" ? extractYouTubeId(form.youtubeInput) : null;
    const vimeoId = form.type === "video" ? extractVimeoId(form.vimeoInput) : null;
    const mediaUrl = form.mediaUrl.trim() || null;

    if (form.type === "video" && !youtubeId && !vimeoId && !mediaUrl) {
      setFormError("Video items need a YouTube link, a Vimeo link, or a direct media URL.");
      return;
    }
    if (mediaUrl && !mediaUrl.startsWith("https://")) {
      setFormError("Direct media URLs must start with https://");
      return;
    }

    setSaving(true);
    setFormError(null);
    const supabase = getBrowserClient();

    const publishedAt = form.published
      ? editing?.published_at ?? new Date().toISOString()
      : null;

    const payload = {
      title: form.title.trim(),
      type: form.type,
      thumbnail_url: form.thumbnailUrl.trim(),
      media_url: form.type === "video" ? mediaUrl : null,
      category: form.category,
      duration: form.type === "video" ? form.duration.trim() || null : null,
      description: form.description.trim() || null,
      tags: parseTags(form.tagsInput),
      featured: form.featured,
      published_at: publishedAt,
      youtube_id: youtubeId,
      vimeo_id: vimeoId,
    };

    try {
      const previousThumbnail = editing?.thumbnail_url ?? null;
      if (editing) {
        const { error: updateError } = await supabase
          .from("media_items")
          .update(payload)
          .eq("id", editing.id);
        if (updateError) throw updateError;
        if (
          previousThumbnail &&
          previousThumbnail !== payload.thumbnail_url &&
          isCmsImageUrl(previousThumbnail)
        ) {
          await deleteCmsImageByUrl(previousThumbnail);
        }
      } else {
        const { error: insertError } = await supabase
          .from("media_items")
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

  const togglePublished = async (item: Media) => {
    const supabase = getBrowserClient();
    const nextPublishedAt =
      item.published_at === null ? new Date().toISOString() : null;
    const { error: updateError } = await supabase
      .from("media_items")
      .update({ published_at: nextPublishedAt })
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
      .from("media_items")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      if (isCmsImageUrl(deleteTarget.thumbnail_url)) {
        await deleteCmsImageByUrl(deleteTarget.thumbnail_url);
      }
      setItems((current) => current.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Hub"
        description="Manage photos and video embeds shown in the public media hub."
        actions={
          canManage && (
            <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Media
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
          icon={<Film className="h-6 w-6" />}
          title="No media items yet"
          description="Add photos and videos to populate the public media hub."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add Media
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
                  <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Visibility</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="h-10 w-14 rounded-md object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground flex items-center gap-1.5">
                            {item.title}
                            {item.featured && (
                              <span className="rounded-full bg-yaaq-gold/10 px-2 py-0.5 text-xs text-yaaq-gold-ink whitespace-nowrap">
                                Featured
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.type}
                            {item.duration ? ` · ${item.duration}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {categoryLabel(item.category, MEDIA_CATEGORY_OPTIONS)}
                    </td>
                    <td className="px-4 py-3">
                      {item.published_at ? (
                        <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Draft
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
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
                            Edit
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
            <DialogTitle>{editing ? "Edit media item" : "Add media item"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this media item. Videos are trusted YouTube or Vimeo embeds."
                : "Upload a thumbnail and link the full image or a trusted video embed."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media-title">Title *</Label>
              <Input
                id="media-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="KTU SRC Week 2024 Highlights"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({ ...form, type: value as "image" | "video" })
                  }
                >
                  <SelectTrigger id="media-type" disabled={saving}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger id="media-category" disabled={saving}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-thumbnail">Thumbnail *</Label>
              <div className="flex items-center gap-3">
                {form.thumbnailUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.thumbnailUrl}
                    alt=""
                    className="h-14 w-20 rounded-md object-cover border border-border shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    id="media-thumbnail"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={saving || uploading}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  {uploading && (
                    <p className="text-xs text-muted-foreground">Uploading…</p>
                  )}
                </div>
              </div>
            </div>

            {form.type === "video" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="media-youtube">YouTube link or ID</Label>
                    <Input
                      id="media-youtube"
                      value={form.youtubeInput}
                      onChange={(e) => setForm({ ...form, youtubeInput: e.target.value })}
                      placeholder="https://youtube.com/watch?v=…"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-vimeo">Vimeo link or ID</Label>
                    <Input
                      id="media-vimeo"
                      value={form.vimeoInput}
                      onChange={(e) => setForm({ ...form, vimeoInput: e.target.value })}
                      placeholder="https://vimeo.com/…"
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="media-duration">Duration</Label>
                    <Input
                      id="media-duration"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="12:34"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-file-url">Direct video URL (https)</Label>
                    <Input
                      id="media-file-url"
                      value={form.mediaUrl}
                      onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                      placeholder="https://… (optional)"
                      disabled={saving}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="media-description">Description</Label>
              <Textarea
                id="media-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-tags">Tags (comma separated)</Label>
              <Input
                id="media-tags"
                value={form.tagsInput}
                onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                placeholder="campus, event, ktu"
                disabled={saving}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                  disabled={saving}
                />
                Featured item
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                  disabled={saving}
                />
                Published on the public site
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button type="button" variant="gold" onClick={save} isLoading={saving || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !saving && !open && setDeleteTarget(null)}
        title="Delete media item?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from the media hub. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
        isLoading={saving}
      />
    </div>
  );
}
