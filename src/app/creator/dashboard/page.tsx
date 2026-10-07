"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileCompletion } from "@/components/dashboard/profile-completion";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  User,
  Edit,
  Briefcase,
  Megaphone,
  Users,
  ArrowRight,
  Inbox,
  Camera,
  Link as LinkIcon,
  Award,
  Clock,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { Notification, Creator } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function CreatorDashboardPage() {
  const { profile, loading, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [creatorData, setCreatorData] = useState<Creator | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserClient();

    const fetchData = async () => {
      const [notifResult, creatorResult] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("creators")
          .select("*")
          .eq("profile_id", user.id)
          .single(),
      ]);

      if (notifResult.data) {
        setNotifications(notifResult.data as Notification[]);
        setUnreadCount(notifResult.data.filter((n: Notification) => !n.read).length);
      }
      setNotificationsLoading(false);

      if (creatorResult.data) {
        setCreatorData(creatorResult.data as Creator);
      }
      setCreatorLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardShell variant="creator">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardShell>
    );
  }

  const quickActions = [
    { name: "My Profile", href: "/profile", icon: User, description: "View your public profile" },
    { name: "Edit Profile", href: "/profile/edit", icon: Edit, description: "Update your details" },
    { name: "Opportunities", href: "/creator/opportunities", icon: Briefcase, description: "Casting calls & crew work" },
    { name: "Notifications", href: "/notifications", icon: Bell, description: `${unreadCount} unread`, badge: unreadCount || undefined },
  ];

  return (
    <DashboardShell variant="creator">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Creator"}
            </h1>
            <p className="mt-1 text-muted-foreground">Your creator workspace for YAAQ World</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">Creator</Badge>
            {creatorData?.is_public && <Badge variant="secondary">Public</Badge>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Card className="h-full transition-all hover:shadow-md hover:border-yaaq-gold/50 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yaaq-gold/10 text-yaaq-gold">
                      <action.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {action.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-semibold px-1.5">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-medium text-foreground text-sm group-hover:text-yaaq-gold transition-colors">
                    {action.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                  Opportunities
                </CardTitle>
                <CardDescription>Casting calls, crew recruitment, and production notices</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<Briefcase className="h-6 w-6" />}
                  title="No open opportunities right now"
                  description="Casting calls, crew recruitment notices, and production opportunities will appear here when published by the YAAQ World team."
                  action={
                    <Link href="/creator/opportunities">
                      <Button variant="outline" size="sm" className="gap-2">
                        Browse Opportunities
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                  Crew Recruitment
                </CardTitle>
                <CardDescription>Production crew calls and team opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No crew calls at the moment"
                  description="When YAAQ World is recruiting crew for productions, those notices will appear here."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creator Profile</CardTitle>
                <CardDescription>Complete your profile to get discovered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {creatorLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-2" />
                    <Skeleton className="h-4" />
                  </div>
                ) : (
                  <ProfileCompletion profile={profile} isCreator creatorData={creatorData} />
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-foreground">
                      {creatorData?.creator_type_id || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">Skills:</span>
                    <span className="font-medium text-foreground">
                      {creatorData?.skills?.length || 0} added
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-medium text-foreground capitalize">
                      {creatorData?.availability?.replace("_", " ") || "Not set"}
                    </span>
                  </div>
                  {creatorData?.portfolio_url && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <a
                        href={creatorData.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yaaq-gold hover:underline truncate"
                      >
                        Portfolio
                      </a>
                    </div>
                  )}
                </div>

                <Link href="/profile/edit" className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Creator Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                  Notifications
                </CardTitle>
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${notification.read ? "bg-background" : "bg-yaaq-gold/5 border-yaaq-gold/30"}`}
                      >
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      </div>
                    ))}
                    <Link href="/notifications">
                      <Button variant="ghost" className="w-full text-sm" size="sm">
                        View all
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Inbox className="h-6 w-6" />}
                    title="No notifications"
                    description="You're all caught up!"
                    className="py-6"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="bg-yaaq-navy text-white border-none">
              <CardContent className="p-6 text-center">
                <Megaphone className="h-8 w-8 mx-auto text-yaaq-gold" aria-hidden="true" />
                <p className="mt-3 font-display text-lg font-semibold">YAAQ World Announcements</p>
                <p className="mt-1 text-sm text-white/70">
                  Announcements and updates from the YAAQ World team will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
