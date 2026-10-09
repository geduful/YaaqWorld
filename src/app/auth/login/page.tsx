"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { validateEmail } from "@/lib/validation";
import { getBrowserClient } from "@/lib/supabase-browser";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  // Same-origin path only: blocks open redirects via ?redirect=//evil.com
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes("\\")
      ? rawRedirect
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const supabase = getBrowserClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";

    setTouched({ email: true, password: true });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ form: "Invalid email or password. Please try again." });
        } else if (error.message.includes("Email not confirmed")) {
          setErrors({ form: "Please verify your email address before signing in." });
        } else {
          setErrors({ form: "Unable to sign in. Please try again." });
        }
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const role = profile?.role || "member";
        let dest = redirectTo;
        if (redirectTo === "/dashboard") {
          if (role === "creator") dest = "/creator/dashboard";
          else if (role === "admin" || role === "super_admin") dest = "/dashboard";
          else dest = "/dashboard";
        }
        router.push(dest);
        router.refresh();
      }
    } catch {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href="/auth/register">
              <Button variant="ghost" size="sm">Create Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your YAAQ World account</p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {errors.form && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    error={touched.email ? errors.email : undefined}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-yaaq-gold hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      error={touched.password ? errors.password : undefined}
                      disabled={isLoading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-[color:var(--yaaq-gold)]"
                  />
                  <span className="text-sm text-muted-foreground">Keep me signed in</span>
                </label>

                <Button type="submit" className="w-full" size="lg" variant="gold" isLoading={isLoading}>
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-yaaq-gold hover:underline font-medium">
                    Join YAAQ World
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
