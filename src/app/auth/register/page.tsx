"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Camera, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const roleOptions: {
  id: "member" | "creator";
  label: string;
  description: string;
  icon: typeof Users;
  features: string[];
  cta: string;
}[] = [
  {
    id: "member",
    label: "Student / Fan",
    description: "For people who want to follow YAAQ World, receive updates, participate in activities, and stay connected.",
    icon: Users,
    features: [
      "Receive campus event updates",
      "Access exclusive content",
      "Participate in community activities",
      "Get notified about opportunities",
      "Connect with creators",
    ],
    cta: "Join as Member",
  },
  {
    id: "creator",
    label: "Creator",
    description: "For photographers, videographers, models, influencers, presenters, designers, editors, and other creative talents who want to connect with YAAQ World opportunities.",
    icon: Camera,
    features: [
      "Showcase your portfolio",
      "Access casting calls & crew notices",
      "Connect with production opportunities",
      "Build your creative profile",
      "Network with brands & agencies",
    ],
    cta: "Join as Creator",
  },
];

export default function RegisterChoicePage() {
  const [selectedRole, setSelectedRole] = useState<"member" | "creator" | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-yaaq">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="YAAQ World Home">
              <span className="font-display text-xl font-bold text-foreground">
                YAAQ<span className="text-yaaq-gold">World</span>
              </span>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block mb-4 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-yaaq-gold-ink bg-yaaq-gold/10 rounded-full">
              JOIN YAAQ WORLD
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              Choose How You Want to Join
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the path that matches your goals. You can always update your profile later.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {roleOptions.map((role) => (
              <Card
                key={role.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                  selectedRole === role.id && "ring-2 ring-yaaq-gold-ink border-yaaq-gold-ink"
                )}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-yaaq-gold/5 rounded-full blur-2xl" aria-hidden="true" />
                <CardHeader className="relative z-10">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yaaq-gold/10 text-yaaq-gold-ink">
                    <role.icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-center font-display text-xl">{role.label}</CardTitle>
                  <CardDescription className="text-center text-base">{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-3 mb-6" role="list">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 shrink-0 text-yaaq-gold-ink mt-0.5" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/auth/register/${role.id}`}>
                    <Button
                      variant={selectedRole === role.id ? "gold" : "outline"}
                      className="w-full justify-center gap-2"
                      size="lg"
                    >
                      {role.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </CardContent>
                {selectedRole === role.id && (
                  <div className="absolute inset-0 bg-yaaq-gold/5 pointer-events-none" aria-hidden="true" />
                )}
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-yaaq-gold-ink hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container-yaaq text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} YAAQ World. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}