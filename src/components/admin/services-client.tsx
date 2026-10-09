"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Service, ServiceFormData } from "@/types";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";

interface ServicesClientProps {
  canManage: boolean;
}

const CATEGORIES = [
  { value: "core", label: "Core" },
  { value: "partnership", label: "Partnership" },
  { value: "consulting", label: "Consulting" },
  { value: "content", label: "Content" },
];

const EMPTY_FORM: ServiceFormData = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  category: "core",
  cta_text: "Get Started",
  pricing_note: "",
  is_featured: false,
  is_active: true,
  display_order: 0,
  features: [],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServicesClient({ canManage }: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const fetchServices = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(500);

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setServices((data ?? []) as Service[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchServices();
      setLoading(false);
    };
    run();
  }, [fetchServices]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFeatureInput("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      short_description: service.short_description ?? "",
      category: service.category,
      cta_text: service.cta_text,
      pricing_note: service.pricing_note ?? "",
      is_featured: service.is_featured,
      is_active: service.is_active,
      display_order: service.display_order,
      features: [...service.features],
    });
    setFeatureInput("");
    setFormError(null);
    setFormOpen(true);
  };

  const addFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setForm((current) => ({ ...current, features: [...current.features, value] }));
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setForm((current) => ({
      ...current,
      features: current.features.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const supabase = getBrowserClient();

    const slug = editing ? editing.slug : slugify(form.title);
    if (!slug) {
      setFormError("Could not generate a slug from the title.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description.trim(),
      short_description: form.short_description.trim() || null,
      category: form.category,
      cta_text: form.cta_text.trim() || "Get Started",
      pricing_note: form.pricing_note.trim() || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 0,
      features: form.features,
    };

    try {
      if (editing) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("services").insert(payload);
        if (insertError) throw insertError;
      }
      await fetchServices();
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
      .from("services")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      setServices((current) => current.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage the public services catalogue."
        actions={
          canManage && (
            <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Service
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
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No services yet"
          description="Create services to populate the public services page."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add Service
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
                  <th scope="col" className="px-4 py-3 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Pricing</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  {canManage && <th scope="col" className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{service.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {service.short_description || service.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-muted-foreground">{service.category}</span>
                      {service.is_featured && (
                        <span className="ml-2 rounded-full bg-yaaq-gold/10 px-2 py-0.5 text-xs text-yaaq-gold">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {service.pricing_note || "Inquiry"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        kind="account"
                        status={service.is_active ? "active" : "inactive"}
                      />
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(service)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setDeleteTarget(service)}
                            aria-label={`Delete ${service.title}`}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this service's details."
                : "Create a new entry for the public services page."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-title">Title *</Label>
              <Input
                id="service-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Video Production"
                disabled={saving}
              />
              {!editing && form.title.trim() && (
                <p className="text-xs text-muted-foreground">
                  Slug: /{slugify(form.title) || "…"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-short">Short description</Label>
              <Input
                id="service-short"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="One-line summary"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-description">Description *</Label>
              <Textarea
                id="service-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this service offers"
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value as ServiceFormData["category"] })
                  }
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-cta">Button text</Label>
                <Input
                  id="service-cta"
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="Get Started"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-pricing">Pricing note</Label>
                <Input
                  id="service-pricing"
                  value={form.pricing_note}
                  onChange={(e) => setForm({ ...form, pricing_note: e.target.value })}
                  placeholder="Leave empty for inquiry-based"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-order">Display order</Label>
                <Input
                  id="service-order"
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-feature">Features</Label>
              <div className="flex gap-2">
                <Input
                  id="service-feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Add a feature"
                  disabled={saving}
                />
                <Button type="button" variant="outline" onClick={addFeature} disabled={saving}>
                  Add
                </Button>
              </div>
              {form.features.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {form.features.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${feature}`}
                        disabled={saving}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  disabled={saving}
                  className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  disabled={saving}
                  className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={save} isLoading={saving}>
              {editing ? "Save changes" : "Create service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete service?"
        description={`"${deleteTarget?.title ?? ""}" will be removed from the services catalogue. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
