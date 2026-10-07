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
  Globe,
  Shield,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { Creator, Institution } from "@/types";

export default function ProfilePage() {
  const { profile, loading, user } = useAuth();
  const [creatorData, setCreatorData] = useState<Creator | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserClient();

    const fetchData = async () => {
      const [creatorResult, institutionResult] = await Promise.all([
        supabase.from("creators").select("*").eq("profile_id", user.id).single(),
        profile?.institution_id
          ? supabase.from("institutions").select("*").eq("id", profile.institution_id).single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (creatorResult.data) setCreatorData(creatorResult.data as Creator);
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

  const isCreator = profile?.role === "creator";

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
    <DashboardShell variant={isCreator ? "creator" : "member"}>
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
                <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-2xl font-semibold">
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
                {profile?.moniker && <p className="text-sm text-yaaq-gold font-medium">&ldquo;{profile.moniker}&rdquo;</p>}
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
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium text-foreground">{profile?.whatsapp || "Not provided"}</p>
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
                  href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-pink-100 transition-colors">
                    <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-pink-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold">Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {profile?.linkedin ? (
                <a
                  href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-blue-100 transition-colors">
                    <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-blue-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold">LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {profile?.tiktok ? (
                <a
                  href={profile.tiktok.startsWith("http") ? profile.tiktok : `https://tiktok.com/@${profile.tiktok.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-gray-100 transition-colors">
                    <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-yaaq-gold">TikTok</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-hidden="true" />
                </a>
              ) : null}

              {!profile?.instagram && !profile?.linkedin && !profile?.tiktok && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No social links added yet.
                </p>
              )}

              <div className="pt-3 border-t">
                <ProfileCompletion profile={profile} isCreator={isCreator} creatorData={creatorData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {isCreator && creatorData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Creator Profile</CardTitle>
              <CardDescription>Your creative details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creatorData.bio && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground">{creatorData.bio}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Availability</p>
                  <Badge variant="secondary" className="capitalize">{creatorData.availability?.replace("_", " ") || "Not set"}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Portfolio</p>
                  {creatorData.portfolio_url ? (
                    <a href={creatorData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-yaaq-gold hover:underline inline-flex items-center gap-1">
                      View Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not added</span>
                  )}
                </div>
              </div>
              {creatorData.skills && creatorData.skills.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {creatorData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
