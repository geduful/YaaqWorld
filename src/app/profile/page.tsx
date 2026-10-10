"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCompletion } from "@/components/dashboard/profile-completion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Mail,
  Phone,
  GraduationCap,
  ExternalLink,
  Instagram,
  Linkedin,
  Shield,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { socialUrl } from "@/lib/social-links";
import { TikTok, WhatsApp } from "@/lib/brand-icons";
import { Institution } from "@/types";

export default function ProfilePage() {
  const { profile, loading, user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserClient();

    const fetchData = async () => {
      const institutionResult = profile?.institution_id
        ? await supabase.from("institutions").select("*").eq("id", profile.institution_id).single()
        : { data: null, error: null };

      if (institutionResult.data) setInstitution(institutionResult.data as Institution);
      setDataLoading(false);
    };

    if (profile) fetchData();
  }, [user, profile]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
        </div>
      </DashboardShell>
    );
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const levelLabels: Record<string, string> = {
    "100": "Level 100", "200": "Level 200", "300": "Level 300", "400": "Level 400", "500": "Level 500",
    postgrad: "Postgraduate", alumni: "Alumni", professional: "Professional", other: "Other",
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <Link href="/profile/edit">
            <Button variant="gold" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold-ink text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-foreground">{profile?.full_name || "User"}</h2>
                  <Badge variant="gold" className="capitalize">{profile?.role}</Badge>
                  {profile?.email_verified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>
                {profile?.bio && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{profile.bio}</p>}
                {profile?.moniker && <p className="text-sm text-yaaq-gold-ink font-medium">&ldquo;{profile.moniker}&rdquo;</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>Your private account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {profile?.whatsapp ? (
                    <WhatsApp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  {profile?.whatsapp ? (
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-yaaq-gold-ink transition-colors"
                    >
                      {profile.whatsapp}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Institution</p>
                  <p className="text-sm font-medium text-foreground">
                    {dataLoading ? "Loading..." : institution?.name || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Level of Study</p>
                  <p className="text-sm font-medium text-foreground">
                    {profile?.level ? levelLabels[profile.level] || profile.level : "Not set"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t text-xs text-muted-foreground">
                <p>Your email and WhatsApp are private and never shown publicly.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>Links visible on your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.instagram ? (
                <a
                  href={socialUrl("instagram", profile.instagram) ?? profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-yaaq-gold/10 transition-colors">
                    <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-yaaq-gold-ink" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold-ink">Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {profile?.linkedin ? (
                <a
                  href={socialUrl("linkedin", profile.linkedin) ?? profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-yaaq-gold/10 transition-colors">
                    <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-yaaq-gold-ink" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold-ink">LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {profile?.tiktok ? (
                <a
                  href={socialUrl("tiktok", profile.tiktok) ?? profile.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-yaaq-gold/10 transition-colors">
                    <TikTok className="h-4 w-4 text-muted-foreground group-hover:text-yaaq-gold-ink" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold-ink">TikTok</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {!profile?.instagram && !profile?.linkedin && !profile?.tiktok && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No social links added yet.
                </p>
              )}

              <div className="pt-3 border-t">
                <ProfileCompletion profile={profile} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
