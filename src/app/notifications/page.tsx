"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Inbox, CheckCheck, Megaphone, Briefcase, Users, Info, Trash2 } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";
import { Notification } from "@/types";

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="h-4 w-4" />,
  opportunity: <Briefcase className="h-4 w-4" />,
  casting: <Bell className="h-4 w-4" />,
  crew: <Users className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
};

export default function NotificationsPage() {
  const { user, profile, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const supabase = getBrowserClient();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (cancelled) return;
      if (data) setNotifications(data as Notification[]);
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user?.id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .eq("user_id", user?.id);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);
  const isCreator = profile?.role === "creator";

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? unreadNotifications
      : readNotifications;

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell variant={isCreator ? "creator" : "member"}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              {unreadNotifications.length > 0
                ? `You have ${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 self-start sm:self-auto">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="text-xs tabular-nums">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="text-xs tabular-nums">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${
                      !notification.read ? "border-l-4 border-l-yaaq-gold bg-yaaq-gold/5 cursor-pointer" : ""
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    role={notification.read ? undefined : "button"}
                    tabIndex={notification.read ? undefined : 0}
                    onKeyDown={(e) => {
                      if (!notification.read && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        markAsRead(notification.id);
                      }
                    }}
                    aria-label={notification.read ? undefined : `Mark as read: ${notification.title}`}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          !notification.read ? "bg-yaaq-gold/10 text-yaaq-gold-ink" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(notification.created_at).toLocaleDateString("en-GH", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        {!notification.read && (
                          <Badge variant="gold" className="mt-2 text-xs">New</Badge>
                        )}
                      </div>
                      <button
                        className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        aria-label={`Delete notification: ${notification.title}`}
                        title={`Delete "${notification.title}"`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-4">
                  <EmptyState
                    icon={<Inbox className="h-6 w-6" />}
                    title={
                      activeTab === "unread"
                        ? "No unread notifications"
                        : activeTab === "read"
                        ? "No read notifications"
                        : "No notifications yet"
                    }
                    description="Notifications about announcements, opportunities, and updates will appear here."
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
