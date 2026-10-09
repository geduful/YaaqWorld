"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBrowserClient } from "@/lib/supabase-browser";
import { socialUrl } from "@/lib/social-links";
import { socialIcons } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe2, MapPin, MessageSquare } from "lucide-react";

interface PublicAmbassador {
  id: string;
  full_name: string;
  photo_url: string | null;
  phone: string;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  institutions: { name: string; location: string | null } | null;
}

function waLink(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("233") ? digits : digits.startsWith("0") ? `233${digits.slice(1)}` : `233${digits}`}`;
}

export function AmbassadorsClient() {
  const [ambassadors, setAmbassadors] = useState<PublicAmbassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      const supabase = getBrowserClient();
      const { data, error: queryError } = await supabase
        .from("ambassadors")
        .select("id, full_name, photo_url, phone, instagram, tiktok, twitter, institutions(name, location)")
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (queryError) {
        setError(true);
      } else {
        // PostgREST types the to-one institutions embed as an array; it is an object at runtime.
        setAmbassadors((data ?? []) as unknown as PublicAmbassador[]);
      }
      setLoading(false);
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || ambassadors.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ambassadors.map((amb) => {
        const wa = waLink(amb.phone);
        const socials = [
          amb.instagram && { platform: "instagram" as const, value: amb.instagram },
          amb.tiktok && { platform: "tiktok" as const, value: amb.tiktok },
          amb.twitter && { platform: "twitter" as const, value: amb.twitter },
        ].filter(Boolean) as { platform: "instagram" | "tiktok" | "twitter"; value: string }[];

        return (
          <Card key={amb.id} className="overflow-hidden text-center">
            <div className="relative aspect-square overflow-hidden">
              {amb.photo_url ? (
                <Image
                  src={amb.photo_url}
                  alt={`${amb.full_name} portrait`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {amb.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <Badge variant="gold" className="absolute bottom-3 left-3 gap-1">
                <Globe2 className="h-3 w-3" />
                Ambassador
              </Badge>
            </div>
            <CardContent className="p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {amb.full_name}
              </h3>
              {amb.institutions?.name && (
                <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {amb.institutions.name}
                </p>
              )}
              {socials.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  {socials.map((social) => {
                    const url = socialUrl(social.platform, social.value);
                    if (!url) return null;
                    const SocialIcon = socialIcons[social.platform];
                    return (
                      <a
                        key={social.platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-yaaq-gold-ink transition-colors"
                        aria-label={`${amb.full_name} on ${social.platform}`}
                      >
                        <SocialIcon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
              {wa && (
                <Button asChild variant="gold" size="sm" className="mt-4 gap-2">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4" />
                    Connect
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
