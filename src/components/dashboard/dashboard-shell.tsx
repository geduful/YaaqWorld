"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Bell,
  LogOut,
  Briefcase,
  Home,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminRole } from "@/lib/permissions";

interface DashboardShellProps {
  children: ReactNode;
  variant?: "member" | "creator";
}

export function DashboardShell({ children, variant = "member" }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isCreator = variant === "creator" || profile?.role === "creator";
  const showAdminLink = isAdminRole(profile?.role);

  const navItems = isCreator
    ? [
        { name: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/profile", icon: User },
        { name: "Opportunities", href: "/creator/opportunities", icon: Briefcase },
        { name: "Notifications", href: "/notifications", icon: Bell },
        ...(showAdminLink ? [{ name: "Admin", href: "/admin", icon: ShieldCheck }] : []),
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/profile", icon: User },
        { name: "Notifications", href: "/notifications", icon: Bell },
        ...(showAdminLink ? [{ name: "Admin", href: "/admin", icon: ShieldCheck }] : []),
      ];

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
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  const isActive = (href: string) =>
    href === "/dashboard" || href === "/creator/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container-yaaq">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="dashboard-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/" className="flex items-center gap-2" aria-label="YAAQ World Home">
                <span className="font-display text-lg font-bold text-foreground">
                  YAAQ<span className="text-yaaq-gold">World</span>
                </span>
              </Link>
              {isCreator && (
                <Badge variant="gold" className="hidden sm:inline-flex">Creator</Badge>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{profile?.role}</p>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                  <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} isLoading={isSigningOut} className="gap-2">
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
            id="dashboard-menu"
            className={cn(
              "md:hidden transition-all duration-300 ease-in-out border-t border-border overscroll-contain",
              mobileMenuOpen
                ? "max-h-[calc(100dvh-4rem)] opacity-100 overflow-y-auto"
                : "max-h-0 opacity-0 overflow-hidden"
            )}
            aria-label="Dashboard navigation"
          >
            <div className="py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-yaaq-gold/10 text-yaaq-gold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-border mt-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Public Site
                </Link>
                <button
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
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
        <aside className="hidden md:flex md:flex-col w-60 border-r border-border bg-muted/20 min-h-[calc(100vh-4rem)] sticky top-16" aria-label="Sidebar navigation">
          <nav className="flex-1 p-4 space-y-1" aria-label="Dashboard sidebar">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-yaaq-gold/10 text-yaaq-gold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Public Site
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
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
