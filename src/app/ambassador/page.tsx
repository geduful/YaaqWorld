"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getBrowserClient } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/image";
import { getDbErrorMessage } from "@/lib/errors";
import { Globe2, Upload, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import { Ambassador } from "@/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function AmbassadorRequestPage() {
  const { loading, user, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isKtu, setIsKtu] = useState(false);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<Ambassador | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !profile) return;
    const supabase = getBrowserClient();

    // Resolve the KTU institution id and the user's institution name.
    const { data: ktuRow } = await supabase
      .from("institutions")
      .select("id, name")
      .eq("short_name", "KTU")
      .maybeSingle();

    if (profile.institution_id && ktuRow && profile.institution_id === ktuRow.id) {
      setIsKtu(true);
      setIsLoading(false);
      return;
    }

    if (profile.institution_id) {
      const { data: inst } = await supabase
        .from("institutions")
        .select("name")
        .eq("id", profile.institution_id)
        .maybeSingle();
      setInstitutionName(inst?.name ?? null);
    }

    const { data: existing } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (existing) setExistingRequest(existing as Ambassador);

    setIsLoading(false);
  }, [user, profile]);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };
    run();
  }, [fetchData]);

  if (loading || isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    redirect("/auth/login?redirect=%2Fambassador");
  }

  const eligible = Boolean(profile?.institution_id) && !isKtu;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFormError("Image must be under 5 MB.");
      return;
    }
    setFormError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!photoFile) {
      setFormError("Please upload a photo so admins can identify you.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please add your phone / WhatsApp number.");
      return;
    }
    if (message.trim().length < 20) {
      setFormError("Please tell us why you want to be an ambassador (at least 20 characters).");
      return;
    }
    if (!profile.institution_id) {
      setFormError("Your account has no institution on file. Please update your profile first.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const supabase = getBrowserClient();

      // Compress the photo aggressively before upload (512px, q0.7).
      let uploadFile: File | Blob = photoFile;
      let ext = (photoFile.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
      try {
        const compressed = await compressImage(photoFile, { maxEdge: 512, quality: 0.7 });
        uploadFile = new File([compressed.blob], `ambassador.${compressed.ext}`, {
          type: compressed.blob.type,
        });
        ext = compressed.ext;
      } catch {
        // Fall back to the original file if compression fails.
      }

      const path = `${user.id}/ambassador.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, uploadFile, { upsert: true });
      if (uploadError) {
        setFormError(getDbErrorMessage(uploadError));
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const photoUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from("ambassadors").insert({
        profile_id: user.id,
        institution_id: profile.institution_id,
        full_name: profile.full_name?.trim() || "YAAQ World Ambassador",
        photo_url: photoUrl,
        phone: phone.trim(),
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        twitter: twitter.trim() || null,
        message: message.trim(),
        status: "pending",
      });
      if (insertError) {
        if (insertError.code === "23505") {
          setFormError("You already have an ambassador request on file.");
        } else {
          setFormError(getDbErrorMessage(insertError));
        }
        return;
      }

      // Use the same photo as the public profile avatar.
      await supabase.from("profiles").update({ avatar_url: photoUrl }).eq("id", user.id);

      setSubmitSuccess(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Status views ---------------------------------------------------------

  if (submitSuccess || (existingRequest && existingRequest.status !== "rejected")) {
    const status = submitSuccess ? "pending" : existingRequest?.status;
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Ambassador Request
            </h1>
            <p className="mt-1 text-muted-foreground">
              Representing YAAQ World at {institutionName ?? "your institution"}
            </p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              {status === "pending" && (
                <>
                  <Clock className="h-12 w-12 mx-auto text-yaaq-gold-ink" aria-hidden="true" />
                  <Badge variant="gold" className="mt-4">Pending review</Badge>
                  <p className="mt-4 font-display text-lg font-semibold text-foreground">
                    Request submitted!
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Our team will review your request and contact you on WhatsApp or phone before approval.
                    You&apos;ll see an Ambassador badge here once approved.
                  </p>
                </>
              )}
              {status === "approved" && (
                <>
                  <CheckCircle2 className="h-12 w-12 mx-auto text-success" aria-hidden="true" />
                  <Badge variant="gold" className="mt-4">Ambassador</Badge>
                  <p className="mt-4 font-display text-lg font-semibold text-foreground">
                    You&apos;re an official YAAQ World Ambassador!
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Your profile is live on our public Team page. Thank you for representing
                    YAAQ World at {institutionName ?? "your institution"}.
                  </p>
                </>
              )}
              {status === "revoked" && (
                <>
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground" aria-hidden="true" />
                  <Badge variant="secondary" className="mt-4">No longer active</Badge>
                  <p className="mt-4 font-display text-lg font-semibold text-foreground">
                    Your ambassador status is inactive
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Contact us if you believe this is a mistake.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (existingRequest?.status === "rejected") {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Ambassador Request
            </h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 mx-auto text-destructive" aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-semibold text-foreground">
                Your request was not approved
              </p>
              {existingRequest.rejection_reason && (
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  {existingRequest.rejection_reason}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                You can contact us on WhatsApp if you have questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (!eligible) {
    return (
      <DashboardShell>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Ambassador Program
            </h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <Globe2 className="h-12 w-12 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-semibold text-foreground">
                Not available for your institution
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                The ambassador program is for members at institutions outside Koforidua
                Technical University — YAAQ World is already based at KTU.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  // ---- Request form ---------------------------------------------------------

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Become an Ambassador
          </h1>
          <p className="mt-1 text-muted-foreground">
            Represent YAAQ World at {institutionName ?? "your institution"} — grow the
            community on your campus and get official recognition.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-yaaq-gold-ink" aria-hidden="true" />
              Ambassador Request
            </CardTitle>
            <CardDescription>
              Our team reviews every request and will contact you before approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive" role="alert">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ambassadorPhoto">Your Photo *</Label>
                <p className="text-xs text-muted-foreground">
                  Used publicly so people at your institution can recognise you. Automatically
                  compressed before upload.
                </p>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <Image
                      src={photoPreview}
                      alt="Photo preview"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover border border-border"
                      unoptimized
                    />
                  )}
                  <label
                    htmlFor="ambassadorPhoto"
                    className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {photoFile ? "Change photo" : "Upload photo"}
                  </label>
                  <input
                    id="ambassadorPhoto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ambassadorPhone">Phone / WhatsApp Number *</Label>
                <Input
                  id="ambassadorPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  autoComplete="tel"
                  maxLength={20}
                  required
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ambassadorInstagram">Instagram (optional)</Label>
                  <Input
                    id="ambassadorInstagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambassadorTiktok">TikTok (optional)</Label>
                  <Input
                    id="ambassadorTiktok"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@username"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ambassadorTwitter">X / Twitter (optional)</Label>
                <Input
                  id="ambassadorTwitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ambassadorMessage">Why do you want to be an ambassador? *</Label>
                <Textarea
                  id="ambassadorMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your campus, your network, and how you'd grow YAAQ World there..."
                  rows={4}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters. This helps admins evaluate your request.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto gap-2" isLoading={submitting}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
