"use client";

import * as React from "react";
import { TeamCard } from "@/components/team/team-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Users, Plus, Filter } from "lucide-react";

const departments = [
  { id: "executive", label: "Executive Management" },
  { id: "production", label: "Media Production" },
  { id: "talent", label: "On-Screen Talent" },
  { id: "digital", label: "Digital Operations" },
];

const teamMembers = [
  {
    name: "Mr. Abdul-Mumin",
    role: "CEO / Founder",
    department: "executive" as const,
    bio: "Visionary leader and founder of YAAQ World, driving the mission to document Ghanaian campus culture.",
    moniker: "The Architect",
    image: undefined,
    socials: [
      { platform: "instagram" as const, url: "#" },
      { platform: "linkedin" as const, url: "#" },
    ],
  },
];

function getMembersByDepartment(dept: string) {
  return teamMembers.filter((m) => m.department === dept);
}

export function TeamDirectoryClient() {
  const [activeTab, setActiveTab] = React.useState("all");

  return (
    <>
      <section className="section-py bg-background" aria-labelledby="team-directory-heading">
        <div className="container-yaaq">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="w-full justify-center gap-2 bg-muted p-1">
              <TabsTrigger value="all" className="px-4 py-2">
                All Members <span className="ml-2 px-2 py-0.5 text-xs bg-yaaq-gold/20 text-yaaq-gold rounded-full">{teamMembers.length}</span>
              </TabsTrigger>
              {departments.map((dept) => (
                <TabsTrigger key={dept.id} value={dept.id} className="px-4 py-2">
                  {dept.label} <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">{getMembersByDepartment(dept.id).length}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teamMembers.map((member, i) => (
                  <TeamCard key={member.name} member={member} className={`animate-in stagger-${i + 1}`} />
                ))}
                {teamMembers.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No team members added yet. Data will be populated from Supabase.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {departments.map((dept) => (
              <TabsContent key={dept.id} value={dept.id} className="mt-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {getMembersByDepartment(dept.id).map((member, i) => (
                    <TeamCard key={member.name} member={member} className={`animate-in stagger-${i + 1}`} />
                  ))}
                  {getMembersByDepartment(dept.id).length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No {dept.label.toLowerCase()} members yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="section-py bg-background" aria-labelledby="departments-heading">
        <div className="container-yaaq">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: "Executive Management", desc: "Strategy, leadership, partnerships, and brand direction.", count: 1 },
              { icon: Users, title: "Media Production", desc: "Photography, videography, editing, and post-production.", count: 0 },
              { icon: Users, title: "On-Screen Talent", desc: "Hosts, presenters, street quiz masters, and campus reporters.", count: 0 },
              { icon: Users, title: "Digital Operations", desc: "Social media, content strategy, community management, and analytics.", count: 0 },
            ].map((dept, i) => (
              <Card key={dept.title} className={`animate-in stagger-${i + 1}`}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold">
                    <dept.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{dept.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{dept.desc}</p>
                  <Badge variant="gold" className="mt-4 inline-block">
                    {dept.count} Member{dept.count !== 1 ? "s" : ""}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}