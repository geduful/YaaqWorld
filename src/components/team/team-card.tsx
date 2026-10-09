"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { socialIcons } from "@/lib/icons";

interface SocialLink {
  platform: "instagram" | "linkedin" | "tiktok";
  url: string;
}

interface TeamMember {
  name: string;
  role: string;
  department: "executive" | "editorial" | "creative" | "digital" | "operations";
  bio?: string;
  image?: string;
  moniker?: string;
  board?: boolean;
  socials?: SocialLink[];
}

interface TeamCardProps {
  member: TeamMember;
  className?: string;
}

const departmentLabels = {
  executive: "Executive",
  editorial: "Editorial",
  creative: "Creative & Design",
  digital: "Digital & Engagement",
  operations: "Operations",
};

const departmentColors = {
  executive: "bg-purple-700 text-white border-transparent shadow-lg",
  editorial: "bg-blue-700 text-white border-transparent shadow-lg",
  creative: "bg-pink-700 text-white border-transparent shadow-lg",
  digital: "bg-emerald-700 text-white border-transparent shadow-lg",
  operations: "bg-amber-400 text-amber-950 border-transparent shadow-lg",
};

export function TeamCard({ member, className }: TeamCardProps) {
  return (
    <Card className={cn("overflow-hidden text-center", className)}>
      <div className="relative aspect-square overflow-hidden">
        {member.image ? (
          <Image
            src={member.image}
            alt={`${member.name} portrait`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-4xl font-bold text-muted-foreground">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
        <Badge
          variant="outline"
          className={cn("absolute bottom-3 left-3", departmentColors[member.department])}
        >
          {departmentLabels[member.department]}
        </Badge>
      </div>
      <CardContent className="p-5">
        {member.moniker && (
          <p className="text-xs font-medium text-yaaq-gold-ink">{member.moniker}</p>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
          {member.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{member.role}</p>
        {member.board && (
          <p className="mt-2">
            <Badge variant="gold" className="mx-auto">Executive Board</Badge>
          </p>
        )}
        {member.bio && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
        )}
        {member.socials && member.socials.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {member.socials.map((social) => {
              const SocialIcon = socialIcons[social.platform];
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-yaaq-gold-ink transition-colors"
                  aria-label={social.platform}
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}