"use client";

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
  Compass,
  Megaphone,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { Notification } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MemberDashboardPage() {
  const { profile, loading, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [isTeamMember, setIsTeamMember] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = getBrowserClient();

    const checkTeamLink = async () => {
      const { data } = await supabase
        .from("team_members")
        .select("id")
        .eq("profile_id", user.id)
        .limit(1)
        .maybeSingle();
      setIsTeamMember(Boolean(data));
    };

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
      setNotificationsLoading(false);
    };

    fetchNotifications();
    checkTeamLink();
  }, [user]);

  if (loading) {
    return (
      <DashboardShell>
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
    { name: "View Profile", href: "/profile", icon: User, description: "View your profile" },
    { name: "Edit Profile", href: "/profile/edit", icon: Edit, description: "Update your details" },
    { name: "Explore Opportunities", href: "/creator/opportunities", icon: Compass, description: "Discover chances" },
    { name: "Notifications", href: "/notifications", icon: Bell, description: `${unreadCount} unread`, badge: unreadCount || undefined },
  ];

  return (
    <DashboardShell variant="member">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {getGreeting()}, {profile?.full_name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-1 text-muted-foreground">Welcome back to your YAAQ World dashboard</p>
          </div>
          {isTeamMember && (
            <Badge variant="gold" className="gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Team member
            </Badge>
          )}
          {profile?.role && (
            <Badge variant="gold" className="self-start sm:self-auto capitalize">{profile.role}</Badge>
          )}
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
                  <Megaphone className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                  Announcements
                </CardTitle>
                <CardDescription>Latest updates from YAAQ World</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<Megaphone className="h-6 w-6" />}
                  title="No announcements yet"
                  description="YAAQ World announcements will appear here when published."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                  Upcoming Opportunities
                </CardTitle>
                <CardDescription>Events, activities, and chances to get involved</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<Compass className="h-6 w-6" />}
                  title="No new opportunities at the moment"
                  description="Check back soon for events, activities, and ways to get involved with YAAQ World."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                <CardDescription>A complete profile helps you get the most out of YAAQ World</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfileCompletion profile={profile} />
                <Link href="/profile/edit" className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Complete Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                    Recent Notifications
                  </CardTitle>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
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
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    ))}
                    <Link href="/notifications">
                      <Button variant="ghost" className="w-full text-sm" size="sm">
                        View all notifications
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
                <Sparkles className="h-8 w-8 mx-auto text-yaaq-gold" aria-hidden="true" />
                <p className="mt-3 font-display text-lg font-semibold">Are you a creator?</p>
                <p className="mt-1 text-sm text-white/70">
                  Showcase your talent and connect with YAAQ World production opportunities.
                </p>
                <Link href="/auth/register/creator">
                  <Button variant="gold" size="sm" className="mt-4 gap-2">
                    Upgrade to Creator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
