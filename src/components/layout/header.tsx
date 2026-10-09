"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Bell, LayoutDashboard, LogOut, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { isAdminRole } from "@/lib/permissions";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Media", href: "/media" },
  { name: "News", href: "/news" },
  { name: "Services", href: "/services" },
  { name: "Booking", href: "/booking" },
  { name: "Contact", href: "/contact" },
];

function UserMenu() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const isCreator = profile?.role === "creator";
  const dashboardHref = isCreator ? "/creator/dashboard" : "/dashboard";

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || undefined} alt="" />
          <AvatarFallback className="bg-yaaq-gold/20 text-yaaq-gold text-xs font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover shadow-md z-50 py-1 animate-in"
          role="menu"
        >
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <Badge variant="gold" className="mt-1.5 capitalize text-xs">{profile?.role || "member"}</Badge>
          </div>
          <Link
            href={dashboardHref}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
          {isAdminRole(profile?.role) && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-yaaq-gold hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
          <div className="border-t mt-1">
            <button
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleSignOut}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCreator = profile?.role === "creator";
  const dashboardHref = isCreator ? "/creator/dashboard" : "/dashboard";

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent",
      )}
      role="banner"
    >
      <nav className="container-yaaq" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="YAAQ World Home">
            <span className="font-display text-xl font-bold text-foreground">
              YAAQ<span className="text-yaaq-gold">World</span>
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-3">
            {loading ? (
              <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" aria-hidden="true" />
            ) : user ? (
              <>
                <Link href={dashboardHref}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                {isAdminRole(profile?.role) && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-yaaq-gold">
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                  </Button>
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gold" size="sm">
                    Join YAAQ World
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out border-t border-border bg-background overscroll-contain",
            mobileMenuOpen
              ? "max-h-[calc(100dvh-4rem)] opacity-100 overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden",
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-2 py-3 text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              {loading ? (
                <div className="h-10 rounded-lg bg-muted animate-pulse" />
              ) : user ? (
                <>
                  <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" className="w-full justify-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {isAdminRole(profile?.role) && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center gap-2 text-yaaq-gold">
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/notifications" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" className="w-full justify-center">
                      Join YAAQ World
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
