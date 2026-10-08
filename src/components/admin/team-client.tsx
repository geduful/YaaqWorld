"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage, getRpcError } from "@/lib/errors";
import { compressImage, extFromName, storagePathFromPublicUrl } from "@/lib/image";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ImageCropDialog, type CropResult } from "@/components/image-crop-dialog";
import { Badge } from "@/components/ui/badge";
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
import { TeamMember, TeamMemberFormData } from "@/types";
import { LayoutGrid, Link2, Pencil, Plus, Trash2, Unlink, Upload } from "lucide-react";

interface TeamClientProps {
  canManage: boolean;
}

interface LinkableUser {
  profile_id: string;
  email: string;
  full_name: string | null;
}

const DEPARTMENTS = [
  { value: "executive", label: "Executive Board" },
  { value: "editorial", label: "Editorial" },
  { value: "creative", label: "Creative & Design" },
  { value: "digital", label: "Digital & Engagement" },
  { value: "operations", label: "Operations" },
];

const EMPTY_FORM: TeamMemberFormData = {
  full_name: "",
  role: "",
  department: "executive",
  bio: "",
  moniker: "",
  instagram: "",
  linkedin: "",
  tiktok: "",
  email: "",
  display_order: 0,
  on_board: false,
  is_active: true,
  image_url: null,
};

export function TeamClient({ canManage }: TeamClientProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamMemberFormData>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<{ file: File; src: string } | null>(null);

  const updateImagePreview = (value: string | null) => {
    setImagePreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return value;
    });
  };
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Link account dialog
  const [linkTarget, setLinkTarget] = useState<TeamMember | null>(null);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkResults, setLinkResults] = useState<LinkableUser[]>([]);
  const [linkSearching, setLinkSearching] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSaving, setLinkSaving] = useState(false);
  const linkReqRef = useRef(0);

  const fetchMembers = useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error: queryError } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (queryError) {
      setError(getDbErrorMessage(queryError));
      return;
    }
    setMembers((data ?? []) as TeamMember[]);
    setError(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchMembers();
      setLoading(false);
    };
    run();
  }, [fetchMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    updateImagePreview(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setForm({
      full_name: member.full_name,
      role: member.role,
      department: member.department,
      bio: member.bio ?? "",
      moniker: member.moniker ?? "",
      instagram: member.instagram ?? "",
      linkedin: member.linkedin ?? "",
      tiktok: member.tiktok ?? "",
      email: member.email ?? "",
      display_order: member.display_order,
      on_board: member.on_board,
      is_active: member.is_active,
      image_url: member.image_url,
    });
    setImageFile(null);
    updateImagePreview(member.image_url);
    setFormError(null);
    setFormOpen(true);
  };

  const onImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      updateImagePreview(editing?.image_url ?? null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be less than 5MB.");
      return;
    }
    setCropSource({ file, src: URL.createObjectURL(file) });
  };

  const closeCrop = () => {
    setCropSource((current) => {
      if (current) URL.revokeObjectURL(current.src);
      return null;
    });
  };

  const onCropConfirm = async (result: CropResult) => {
    setCropSource((current) => {
      if (current) URL.revokeObjectURL(current.src);
      return null;
    });
    const cropped = new File([result.blob], `team-${Date.now()}.${result.ext}`, {
      type: result.blob.type,
    });
    setImageFile(cropped);
    updateImagePreview(URL.createObjectURL(result.blob));
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.role.trim()) {
      setFormError("Full name and role are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    setNotice(null);
    const supabase = getBrowserClient();

    try {
      let imageUrl = editing?.image_url ?? null;
      const oldPath = imageUrl ? storagePathFromPublicUrl(imageUrl, "avatars") : null;
      let uploadedPath: string | null = null;

      if (imageFile && user) {
        let blob: Blob = imageFile;
        let ext = extFromName(imageFile.name);
        try {
          const result = await compressImage(imageFile, { maxEdge: 1024 });
          blob = result.blob;
          ext = result.ext;
        } catch {
          blob = imageFile;
          ext = extFromName(imageFile.name);
        }
        const path = `${user.id}/team-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { upsert: true });
        if (uploadError) throw new Error(getDbErrorMessage(uploadError));
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);
        imageUrl = publicUrl;
        uploadedPath = path;
      }

      const payload = {
        full_name: form.full_name.trim(),
        role: form.role.trim(),
        department: form.department,
        bio: form.bio.trim() || null,
        moniker: form.moniker.trim() || null,
        instagram: form.instagram.trim() || null,
        linkedin: form.linkedin.trim() || null,
        tiktok: form.tiktok.trim() || null,
        email: form.email.trim() || null,
        display_order: Number(form.display_order) || 0,
        on_board: form.on_board,
        image_url: imageUrl,
        is_active: form.is_active,
      };

      try {
        if (editing) {
          const { error: updateError } = await supabase
            .from("team_members")
            .update(payload)
            .eq("id", editing.id);
          if (updateError) throw new Error(getDbErrorMessage(updateError));
        } else {
          const { error: insertError } = await supabase.from("team_members").insert(payload);
          if (insertError) throw new Error(getDbErrorMessage(insertError));
        }
      } catch (err) {
        if (uploadedPath) {
          await supabase.storage.from("avatars").remove([uploadedPath]).catch(() => undefined);
        }
        throw err;
      }

      if (uploadedPath && oldPath && oldPath !== uploadedPath) {
        await supabase.storage.from("avatars").remove([oldPath]).catch(() => undefined);
      }

      await fetchMembers();
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : getDbErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const supabase = getBrowserClient();
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("id", deleteTarget.id);

    if (deleteError) {
      setError(getDbErrorMessage(deleteError));
    } else {
      const imagePath = deleteTarget.image_url
        ? storagePathFromPublicUrl(deleteTarget.image_url, "avatars")
        : null;
      if (imagePath) {
        await supabase.storage.from("avatars").remove([imagePath]).catch(() => undefined);
      }
      setMembers((current) => current.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setSaving(false);
  };

  const openLink = (member: TeamMember) => {
    setLinkTarget(member);
    setLinkQuery("");
    setLinkResults([]);
    setLinkError(null);
  };

  const closeLink = () => {
    setLinkTarget(null);
    setLinkQuery("");
    setLinkResults([]);
    setLinkError(null);
    setLinkSearching(false);
    ++linkReqRef.current;
  };

  const handleLinkQueryChange = (value: string) => {
    setLinkQuery(value);
    if (value.trim().length < 2) {
      setLinkResults([]);
      setLinkSearching(false);
      setLinkError(null);
    } else {
      setLinkSearching(true);
      setLinkError(null);
    }
  };

  useEffect(() => {
    const query = linkQuery.trim();
    const requestId = ++linkReqRef.current;
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      const supabase = getBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("search_linkable_users", {
        p_query: query,
        p_limit: 8,
      });
      if (requestId !== linkReqRef.current) return;
      setLinkSearching(false);
      if (rpcError) {
        setLinkError(getRpcError(rpcError));
      } else {
        setLinkResults((data ?? []) as LinkableUser[]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [linkQuery]);

  const runLink = async (account: LinkableUser) => {
    if (!linkTarget) return;
    setLinkSaving(true);
    setLinkError(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("link_team_member", {
      p_team_id: linkTarget.id,
      p_profile_id: account.profile_id,
    });

    if (rpcError) {
      setLinkError(getRpcError(rpcError));
    } else {
      const listedName = linkTarget.full_name;
      closeLink();
      await fetchMembers();
      setNotice(`${account.email} is now linked to ${listedName}.`);
    }
    setLinkSaving(false);
  };

  const runUnlink = async (member: TeamMember) => {
    setLinkSaving(true);
    setError(null);
    setNotice(null);
    const supabase = getBrowserClient();
    const { error: rpcError } = await supabase.rpc("link_team_member", {
      p_team_id: member.id,
      p_profile_id: null,
    });

    if (rpcError) {
      setError(getRpcError(rpcError));
    } else {
      await fetchMembers();
      setNotice(`Account unlinked from ${member.full_name}.`);
    }
    setLinkSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage the official YAAQ World team directory."
        actions={
          canManage && (
            <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          )
        }
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600" role="status">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-6 w-6" />}
          title="No team members yet"
          description="Add team members to build the official team directory."
          action={
            canManage && (
              <Button variant="gold" size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="h-36 bg-muted flex items-center justify-center overflow-hidden">
                {member.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image_url}
                    alt={member.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-3xl font-bold text-yaaq-gold/60">
                    {member.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{member.full_name}</p>
                    <p className="text-sm text-yaaq-gold truncate">{member.role}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                    {DEPARTMENTS.find((d) => d.value === member.department)?.label ?? member.department}
                  </span>
                </div>
                {member.email && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">{member.email}</p>
                )}
                <p className="mt-2 flex flex-wrap items-center gap-1.5">
                  {member.on_board && <Badge variant="gold">Executive Board</Badge>}
                  {member.profile_id ? (
                    <Badge variant="gold">Account linked</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No account linked</span>
                  )}
                </p>
                {member.bio && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
                )}
                {!member.is_active && (
                  <p className="mt-2 text-xs text-amber-600">Hidden from public site</p>
                )}
                {canManage && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!member.profile_id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 flex-1"
                        onClick={() => openLink(member)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Link account
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 flex-1"
                        onClick={() => runUnlink(member)}
                        isLoading={linkSaving}
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        Unlink
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 flex-1"
                      onClick={() => openEdit(member)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setDeleteTarget(member)}
                      aria-label={`Delete ${member.full_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !saving && setFormOpen(open)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit team member" : "Add team member"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this team member's details."
                : "Add a new person to the official team directory."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team-name">Full name *</Label>
                <Input
                  id="team-name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-role">Role *</Label>
                <Input
                  id="team-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Producer"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(value) =>
                    setForm({ ...form, department: value as TeamMemberFormData["department"] })
                  }
                  disabled={saving}
                >
                  <SelectTrigger aria-label="Department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-order">Display order</Label>
                <Input
                  id="team-order"
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-email">Email (optional)</Label>
              <Input
                id="team-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Used to automatically detect their account when they sign up.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-bio">Bio</Label>
              <Textarea
                id="team-bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Short biography"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-moniker">Moniker</Label>
              <Input
                id="team-moniker"
                value={form.moniker}
                onChange={(e) => setForm({ ...form, moniker: e.target.value })}
                placeholder="Stage name or nickname"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="team-instagram">Instagram</Label>
                <Input
                  id="team-instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@handle"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-linkedin">LinkedIn</Label>
                <Input
                  id="team-linkedin"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="Profile URL"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-tiktok">TikTok</Label>
                <Input
                  id="team-tiktok"
                  value={form.tiktok}
                  onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  placeholder="@handle"
                  disabled={saving}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.on_board}
                onChange={(e) => setForm({ ...form, on_board: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
              />
              <span className="text-sm font-medium">Executive Board member (Article 3.1)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
              />
              <span className="text-sm font-medium">Visible on the public site</span>
            </label>

            <div className="space-y-2">
              <Label htmlFor="team-photo">Photo</Label>
              <div className="flex items-center gap-3">
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Team member preview"
                    className="h-16 w-16 rounded-lg object-cover border"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {imagePreview ? "Change image" : "Upload image"}
                  <input
                    id="team-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={(e) => {
                      onImageChange(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                    disabled={saving}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF. Max 5MB.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="gold" onClick={save} isLoading={saving}>
              {editing ? "Save changes" : "Add member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link account dialog */}
      <Dialog
        open={linkTarget !== null}
        onOpenChange={(open) => !linkSaving && open === false && closeLink()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link an account</DialogTitle>
            <DialogDescription>
              {linkTarget
                ? `Find the signed-in account for ${linkTarget.full_name} and attach it to this listing.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="link-user-search">Search accounts</Label>
            <Input
              id="link-user-search"
              type="search"
              value={linkQuery}
              onChange={(e) => handleLinkQueryChange(e.target.value)}
              placeholder="Type a name or email address…"
              autoComplete="off"
              disabled={linkSaving}
            />
            <p className="text-xs text-muted-foreground">
              Only accounts that are not already linked to another team member are shown.
            </p>
          </div>

          {linkError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {linkError}
            </div>
          )}

          {linkSearching && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!linkSearching && !linkError && linkQuery.trim().length >= 2 && linkResults.length === 0 && (
            <p className="text-sm text-muted-foreground">No matching accounts found.</p>
          )}

          {!linkSearching && linkResults.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {linkResults.map((account) => (
                <div
                  key={account.profile_id}
                  className="rounded-lg border p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {account.full_name || account.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    className="shrink-0"
                    disabled={linkSaving}
                    onClick={() => runLink(account)}
                  >
                    Link
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeLink} disabled={linkSaving}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete team member?"
        description={`${deleteTarget?.full_name ?? "This person"} will be removed from the team directory. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={saving}
        onConfirm={remove}
      />

      <ImageCropDialog
        open={cropSource !== null}
        src={cropSource?.src ?? null}
        file={cropSource?.file ?? null}
        aspect={1}
        cropShape="rect"
        maxEdge={1024}
        title="Position the photo"
        onCancel={closeCrop}
        onConfirm={onCropConfirm}
      />
    </div>
  );
}
