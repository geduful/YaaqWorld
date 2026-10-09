"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { deleteCmsImageByUrl, isCmsImageUrl, uploadCmsImage } from "@/lib/cms-media";
import { estimateReadTime } from "@/lib/content";
import { NEWS_CATEGORY_OPTIONS, categoryLabel } from "@/lib/content-categories";
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
import { NewsArticle } from "@/types";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";

interface NewsClientProps {
  canManage: boolean;
}

interface NewsFormState {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  tagsInput: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_FORM: NewsFormState = {
  title: "",
  category: "general",
  excerpt: "",
  content: "",
  imageUrl: "",
  tagsInput: "",
  featured: false,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function NewsClient({ canManage }: NewsClientProps) {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<NewsFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);

  const fetchArticles = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setArticles((data ?? []) as NewsArticle[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchArticles();
      setLoading(false);
    };
    run();
  }, [fetchArticles]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditing(article);
    setForm({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.featured_image_url ?? "",
      tagsInput: article.tags.join(", "),
      featured: article.featured,
      status: article.status,
      seoTitle: article.seo_title ?? "",
      seoDescription: article.seo_description ?? "",
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
      setForm((current) => ({ ...current, imageUrl: url }));
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
    if (!form.excerpt.trim()) {
      setFormError("Excerpt is required.");
      return;
    }
    if (!form.content.trim()) {
      setFormError("Content is required.");
      return;
    }

    setSaving(true);
    setFormError(null);
    const supabase = getBrowserClient();

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category,
      featured_image_url: form.imageUrl.trim() || null,
      tags: parseTags(form.tagsInput),
      featured: form.featured,
      status: form.status,
      read_time: estimateReadTime(form.content),
      seo_title: form.seoTitle.trim() || null,
      seo_description: form.seoDescription.trim() || null,
    };

    try {
      const previousImage = editing?.featured_image_url ?? null;
      if (editing) {
        const { error: updateError } = await supabase
          .from("news_articles")
          .update(payload)
          .eq("id", editing.id);
        if (updateError) throw updateError;
        if (
          previousImage &&
          previousImage !== payload.featured_image_url &&
          isCmsImageUrl(previousImage)
        ) {
          await deleteCmsImageByUrl(previousImage);
        }
      } else {
        const { error: insertError } = await supabase.from("news_articles").insert({
          ...payload,
          author_id: user?.id ?? null,
          created_by: user?.id ?? null,
        });
        if (insertError) throw insertError;
      }
      await fetchArticles();
      setFormOpen(false);
    } catch (err) {
      setFormError(getDbErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("news_articles")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      if (isCmsImageUrl(deleteTarget.featured_image_url)) {
        await deleteCmsImageByUrl(deleteTarget.featured_image_url);
      }
      setArticles((current) => current.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        description="Write and publish news articles for the public site."
        actions={
          canManage && (
            <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Article
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
      ) : articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-6 w-6" />}
          title="No articles yet"
          description="Create your first article to populate the public news page."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Article
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
                  <th scope="col" className="px-4 py-3 font-medium">Article</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Created</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        {article.title}
                        {article.featured && (
                          <span className="rounded-full bg-yaaq-gold/10 px-2 py-0.5 text-xs text-yaaq-gold whitespace-nowrap">
                            Featured
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {categoryLabel(article.category, NEWS_CATEGORY_OPTIONS)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="news" status={article.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(article)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setDeleteTarget(article)}
                            aria-label={`Delete ${article.title}`}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit article" : "New article"}</DialogTitle>
            <DialogDescription>
              Article content is plain text — paragraphs are separated by blank lines.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Title *</Label>
              <Input
                id="news-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NEWS_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm({ ...form, status: value as NewsFormState["status"] })
                  }
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-excerpt">Excerpt *</Label>
              <Textarea
                id="news-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-content">Content * (plain text, blank line = new paragraph)</Label>
              <Textarea
                id="news-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Reading time: about {estimateReadTime(form.content)} min
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-image">Featured image</Label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-14 w-20 rounded-md object-cover border border-border shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    id="news-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={saving || uploading}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-tags">Tags (comma separated)</Label>
              <Input
                id="news-tags"
                value={form.tagsInput}
                onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="news-seo-title">SEO title</Label>
                <Input
                  id="news-seo-title"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-seo-desc">SEO description</Label>
                <Input
                  id="news-seo-desc"
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
              />
              <span className="text-sm font-medium">Featured article</span>
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={save} isLoading={saving || uploading}>
              {editing ? "Save changes" : "Create article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete article?"
        description={`"${deleteTarget?.title ?? ""}" will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
