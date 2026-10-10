"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Save,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle,
  Instagram,
  Linkedin,
} from "lucide-react";
import { TikTok } from "@/lib/brand-icons";
import { getBrowserClient } from "@/lib/supabase-browser";
import { getDbErrorMessage } from "@/lib/errors";
import { storagePathFromPublicUrl } from "@/lib/image";
import { ImageCropDialog, type CropResult } from "@/components/image-crop-dialog";
import { Institution } from "@/types";

const levels = [
  { value: "100", label: "Level 100 (First Year)" },
  { value: "200", label: "Level 200 (Second Year)" },
  { value: "300", label: "Level 300 (Third Year)" },
  { value: "400", label: "Level 400 (Final Year)" },
  { value: "500", label: "Level 500 (Postgraduate)" },
  { value: "postgrad", label: "Postgraduate" },
  { value: "alumni", label: "Alumni" },
  { value: "professional", label: "Working Professional" },
  { value: "other", label: "Other" },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const { profile, loading, refreshProfile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [level, setLevel] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<{ file: File; src: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = getBrowserClient();

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const loadData = async () => {
      const [instResult] = await Promise.all([
        supabase.from("institutions").select("*").eq("is_active", true).order("name"),
      ]);

      if (cancelled) return;
      if (instResult.data) setInstitutions(instResult.data as Institution[]);
      setFullName(profile.full_name || "");
      setWhatsapp(profile.whatsapp || "");
      setBio(profile.bio || "");
      setLevel(profile.level || "");
      setInstitutionId(profile.institution_id || "");
      setInstagram(profile.instagram || "");
      setLinkedin(profile.linkedin || "");
      setTiktok(profile.tiktok || "");
      setAvatarUrl(profile.avatar_url);
      setIsInitialized(true);
    };
    loadData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be less than 5MB" });
      return;
    }

    setMessage(null);
    setCropSource({ file, src: URL.createObjectURL(file) });
  };

  const closeCrop = () => {
    setCropSource((current) => {
      if (current) URL.revokeObjectURL(current.src);
      return null;
    });
  };

  const handleCropConfirm = async (result: CropResult) => {
    setCropSource((current) => {
      if (current) URL.revokeObjectURL(current.src);
      return null;
    });
    if (!user) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const oldPath = avatarUrl ? storagePathFromPublicUrl(avatarUrl, "avatars") : null;
      const fileName = `${user.id}/avatar-${Date.now()}.${result.ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, result.blob);

      if (uploadError) {
        setMessage({ type: "error", text: getDbErrorMessage(uploadError) });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        if (oldPath !== fileName) {
          await supabase.storage.from("avatars").remove([fileName]).catch(() => undefined);
        }
        setMessage({ type: "error", text: getDbErrorMessage(updateError) });
        return;
      }

      if (oldPath && oldPath !== fileName) {
        await supabase.storage.from("avatars").remove([oldPath]).catch(() => undefined);
      }

      setAvatarUrl(publicUrl);
      setPhotoPreview(null);
      await refreshProfile();
      setMessage({ type: "success", text: "Profile photo updated!" });
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setIsUploading(true);
    setMessage(null);

    try {
      const path = avatarUrl ? storagePathFromPublicUrl(avatarUrl, "avatars") : null;
      if (path) {
        await supabase.storage.from("avatars").remove([path]).catch(() => undefined);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) {
        setMessage({ type: "error", text: "Unable to remove photo." });
        return;
      }

      setAvatarUrl(null);
      setPhotoPreview(null);
      await refreshProfile();
      setMessage({ type: "success", text: "Profile photo removed." });
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setMessage({ type: "error", text: "Please enter your full name (at least 2 characters)." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updates: Record<string, string | null> = {
        full_name: fullName.trim(),
        whatsapp: whatsapp || null,
        bio: bio || null,
        level: level || null,
        institution_id: institutionId || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        tiktok: tiktok || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        setMessage({ type: "error", text: "Unable to update profile. Please try again." });
        return;
      }

      await refreshProfile();
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !isInitialized) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardShell>
    );
  }

  const getInitials = () => {
    if (fullName) return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return "U";
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-1 text-muted-foreground">Update your personal information and social links</p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "border border-success/30 bg-success-soft text-success"
                : "bg-destructive/10 text-destructive"
            }`}
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Photo</CardTitle>
            <CardDescription>JPG, PNG, or WebP. Max 5MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoPreview || avatarUrl || undefined} alt="" />
                <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold-ink text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="sr-only"
                  id="avatar-upload"
                  disabled={isUploading}
                />
                <div className="flex flex-wrap gap-2">
                  <Label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center gap-2 h-9 px-4 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    {isUploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
                  </Label>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      disabled={isUploading}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ImageCropDialog
          open={cropSource !== null}
          src={cropSource?.src ?? null}
          file={cropSource?.file ?? null}
          aspect={1}
          cropShape="round"
          maxEdge={512}
          title="Position your photo"
          onCancel={closeCrop}
          onConfirm={handleCropConfirm}
        />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Fields marked with * are required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+233 24 123 4567"
                  disabled={isSaving}
                  inputMode="tel"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Select
                    value={institutionId}
                    onValueChange={setInstitutionId}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="institution">
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level of Study</Label>
                  <Select value={level} onValueChange={setLevel} disabled={isSaving}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>How people can find you online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-1.5">
                  <Instagram className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username or full URL"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                  <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-1.5">
                  <TikTok className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@username or full URL"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-3">
            <Button type="submit" variant="gold" size="lg" isLoading={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
