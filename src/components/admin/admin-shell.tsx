"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LogOut,
  Home,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Star,
  LayoutGrid,
  Briefcase,
  Film,
  Newspaper,
  CalendarCheck,
  Target,
  Megaphone,
  UserCog,
  ScrollText,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: ReactNode;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> },
  { name: "Members", href: "/admin/members", icon: <Users className="h-4 w-4" aria-hidden="true" /> },
  { name: "Creators", href: "/admin/creators", icon: <Star className="h-4 w-4" aria-hidden="true" /> },
  { name: "Team", href: "/admin/team", icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" /> },
  { name: "Services", href: "/admin/services", icon: <Briefcase className="h-4 w-4" aria-hidden="true" /> },
  { name: "Media", href: "/admin/media", icon: <Film className="h-4 w-4" aria-hidden="true" /> },
  { name: "News", href: "/admin/news", icon: <Newspaper className="h-4 w-4" aria-hidden="true" /> },
  { name: "Bookings", href: "/admin/bookings", icon: <CalendarCheck className="h-4 w-4" aria-hidden="true" /> },
  { name: "Opportunities", href: "/admin/opportunities", icon: <Target className="h-4 w-4" aria-hidden="true" /> },
  { name: "Announcements", href: "/admin/notifications", icon: <Megaphone className="h-4 w-4" aria-hidden="true" /> },
  { name: "Administrators", href: "/admin/administrators", icon: <UserCog className="h-4 w-4" aria-hidden="true" /> },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: <ScrollText className="h-4 w-4" aria-hidden="true" /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" aria-hidden="true" /> },
];

interface AdminShellProps {
  children: ReactNode;
  visibleNav: string[];
  isSuperAdmin: boolean;
  adminName: string;
}

export function AdminShell({ children, visibleNav, isSuperAdmin, adminName }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = ADMIN_NAV_ITEMS.filter((item) => visibleNav.includes(item.href));

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = () => {
    const name = adminName || profile?.full_name;
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "A";
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-yaaq-navy/95 backdrop-blur-sm">
        <div className="container-yaaq">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-lg text-white/70 hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/admin" className="flex items-center gap-2" aria-label="Admin home">
                <ShieldCheck className="h-5 w-5 text-yaaq-gold" aria-hidden="true" />
                <span className="font-display text-lg font-bold text-white">
                  YAAQ<span className="text-yaaq-gold">Admin</span>
                </span>
              </Link>
              <Badge variant="gold" className="hidden sm:inline-flex">
                {isSuperAdmin ? "Super Admin" : "Administrator"}
              </Badge>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Home className="h-4 w-4" aria-hidden="true" />
                Public Site
              </Link>
              <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-white leading-tight">{adminName || "Administrator"}</p>
                  <p className="text-xs text-white/60">{user?.email ?? ""}</p>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                  <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                isLoading={isSigningOut}
                className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <button
              className="md:hidden flex items-center gap-2"
              onClick={() => router.push("/profile")}
              aria-label="Open profile"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          <nav
            id="admin-menu"
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out border-t border-white/10 overscroll-contain",
            mobileMenuOpen
              ? "max-h-[calc(100dvh-4rem)] opacity-100 overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden",
          )}
            aria-label="Admin navigation"
          >
            <div className="py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border border-white/15 bg-white/10 text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-3 border-t border-white/10 pt-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  My Dashboard
                </Link>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside
          className="hidden md:flex md:flex-col w-60 border-r border-border bg-muted/20 min-h-[calc(100vh-4rem)] sticky top-16"
          aria-label="Admin sidebar"
        >
          <nav className="flex-1 p-4 space-y-1" aria-label="Admin sidebar navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "border border-border/70 bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              My Dashboard
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="container-yaaq py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
