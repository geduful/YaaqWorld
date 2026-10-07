"use client";

import { ReactNode } from "react";
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
  department: "executive" | "production" | "talent" | "digital";
  bio?: string;
  image?: string;
  moniker?: string;
  socials?: SocialLink[];
}

interface TeamCardProps {
  member: TeamMember;
  className?: string;
}

const departmentLabels = {
  executive: "Executive Management",
  production: "Media Production",
  talent: "On-Screen Talent",
  digital: "Digital Operations",
};

const departmentColors = {
  executive: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  production: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  talent: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  digital: "bg-green-500/10 text-green-600 border-green-500/20",
};

export function TeamCard({ member, className }: TeamCardProps) {
  const Icon = member.socials?.[0] ? socialIcons[member.socials[0].platform] : null;

  return (
    <Card className={cn("group overflow-hidden text-center", className)}>
      <div className="relative aspect-square overflow-hidden">
        {member.image ? (
          <img
            src={member.image}
            alt={`${member.name} portrait`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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
          <p className="text-xs font-medium text-yaaq-gold">{member.moniker}</p>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
          {member.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{member.role}</p>
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
                  className="text-muted-foreground hover:text-yaaq-gold transition-colors"
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