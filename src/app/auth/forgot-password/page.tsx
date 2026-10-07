"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { validateEmail } from "@/lib/validation";
import { getBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const supabase = getBrowserClient();

  const emailError = touched && !validateEmail(email) ? "Please enter a valid email address" : undefined;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setTouched(true);

    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError("Unable to send the reset email. Please try again.");
        return;
      }

      setIsSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
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
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {!isSent ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yaaq-gold/10">
                  <KeyRound className="h-7 w-7 text-yaaq-gold" aria-hidden="true" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Forgot Password?</h1>
                <p className="mt-2 text-muted-foreground">
                  Enter your email and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched(true)}
                          error={emailError}
                          disabled={isLoading}
                          autoComplete="email"
                          required
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" variant="gold" isLoading={isLoading}>
                      Send Reset Link
                    </Button>

                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                      </Button>
                    </Link>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Check Your Email</h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>,
                  we&apos;ve sent a password reset link.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground text-left">
                  <p className="font-medium text-foreground mb-1">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the email from YAAQ World</li>
                    <li>Click the secure reset link</li>
                    <li>Create your new password</li>
                  </ol>
                  <p className="text-xs mt-2">Check your spam folder if you don&apos;t see the email.</p>
                </div>
                <div className="mt-6 space-y-3">
                  <Link href="/auth/login">
                    <Button variant="gold" className="w-full">Return to Sign In</Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { setIsSent(false); setError(""); }}>
                    Try a Different Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
