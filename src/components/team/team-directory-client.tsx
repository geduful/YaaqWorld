"use client";

import * as React from "react";
import { TeamCard } from "@/components/team/team-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBrowserClient } from "@/lib/supabase-browser";
import { Users } from "lucide-react";

const departments = [
  { id: "executive", label: "Executive Board" },
  { id: "editorial", label: "Editorial" },
  { id: "creative", label: "Creative & Design" },
  { id: "digital", label: "Digital & Engagement" },
  { id: "operations", label: "Operations" },
];

interface SocialLink {
  platform: "instagram" | "linkedin" | "tiktok";
  url: string;
}

interface DirectoryMember {
  name: string;
  role: string;
  department: "executive" | "editorial" | "creative" | "digital" | "operations";
  bio?: string;
  image?: string;
  moniker?: string;
  board?: boolean;
  socials?: SocialLink[];
}

interface TeamRow {
  id: string;
  full_name: string;
  role: string;
  department: "executive" | "editorial" | "creative" | "digital" | "operations";
  bio: string | null;
  image_url: string | null;
  moniker: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  on_board: boolean;
}

function socialUrl(platform: SocialLink["platform"], value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("@")) {
    if (platform === "instagram") return `https://www.instagram.com/${v}`;
    if (platform === "tiktok") return `https://www.tiktok.com/${v}`;
    return null;
  }
  if (platform === "linkedin" && v.includes(".")) return `https://${v}`;
  return null;
}

function toMember(row: TeamRow): DirectoryMember {
  const socials: SocialLink[] = [];
  const addSocial = (platform: SocialLink["platform"], value: string | null) => {
    if (!value) return;
    const url = socialUrl(platform, value);
    if (url) socials.push({ platform, url });
  };
  addSocial("instagram", row.instagram);
  addSocial("linkedin", row.linkedin);
  addSocial("tiktok", row.tiktok);

  return {
    name: row.full_name,
    role: row.role,
    department: row.department,
    bio: row.bio ?? undefined,
    image: row.image_url ?? undefined,
    moniker: row.moniker ?? undefined,
    board: row.on_board,
    socials: socials.length > 0 ? socials : undefined,
  };
}

function getMembersByDepartment(members: DirectoryMember[], dept: string) {
  return members.filter((m) => m.department === dept);
}

// The Executive Board tab (Article 3.1) shows everyone flagged on_board,
// plus anyone housed in the executive department.
function getTabMembers(members: DirectoryMember[], tab: string) {
  if (tab === "executive") {
    return members.filter((m) => m.board || m.department === "executive");
  }
  return getMembersByDepartment(members, tab);
}

export function TeamDirectoryClient() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [members, setMembers] = React.useState<DirectoryMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const run = async () => {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("team_members")
        .select(
          "id, full_name, role, department, bio, image_url, moniker, instagram, linkedin, tiktok, on_board"
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(100);
      if (!error && data) {
        setMembers((data as TeamRow[]).map(toMember));
      }
      setLoading(false);
    };
    run();
  }, []);

  return (
    <>
      <section className="section-py bg-background" aria-labelledby="team-directory-heading">
        <div className="container-yaaq">
          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="w-full justify-center gap-2 bg-muted p-1 flex-wrap">
                <TabsTrigger value="all" className="px-4 py-2">
                  All Members <span className="ml-2 px-2 py-0.5 text-xs bg-yaaq-gold/20 text-yaaq-gold rounded-full">{members.length}</span>
                </TabsTrigger>
                {departments.map((dept) => (
                  <TabsTrigger key={dept.id} value={dept.id} className="px-4 py-2">
                    {dept.label} <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">{getTabMembers(members, dept.id).length}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {members.map((member, i) => (
                    <TeamCard key={member.name} member={member} className={`animate-in stagger-${i + 1}`} />
                  ))}
                  {members.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No team members yet. They will appear here once added from the admin panel.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {departments.map((dept) => (
                <TabsContent key={dept.id} value={dept.id} className="mt-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {getTabMembers(members, dept.id).map((member, i) => (
                      <TeamCard key={member.name} member={member} className={`animate-in stagger-${i + 1}`} />
                    ))}
                    {getTabMembers(members, dept.id).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No {dept.label.toLowerCase()} members yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="departments-heading">
        <div className="container-yaaq">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "editorial", title: "Editorial Department", desc: "Oversees content creation, journalism, and editorial standards." },
              { id: "creative", title: "Creative & Design Department", desc: "Manages visual content, branding, and design elements." },
              { id: "digital", title: "Digital & Engagement Department", desc: "Handles social media, digital platforms, and audience engagement." },
              { id: "operations", title: "Operations Department", desc: "Manages administrative functions, logistics, and resource allocation." },
            ].map((dept, i) => {
              const count = getMembersByDepartment(members, dept.id).length;
              return (
                <Card key={dept.title} className={`animate-in stagger-${i + 1}`}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{dept.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{dept.desc}</p>
                    <Badge variant="gold" className="mt-4 inline-block">
                      {count} Member{count !== 1 ? "s" : ""}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
