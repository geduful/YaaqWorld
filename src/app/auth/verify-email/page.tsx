"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-browser";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  const supabase = getBrowserClient();

  const handleResend = async () => {
    if (!email) {
      setResendStatus("error");
      setResendMessage("Please provide your email address to resend the verification.");
      return;
    }

    setIsResending(true);
    setResendStatus("idle");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        setResendStatus("error");
        setResendMessage("Unable to resend the email. Please try again in a moment.");
      } else {
        setResendStatus("success");
        setResendMessage("Verification email sent! Please check your inbox.");
      }
    } catch {
      setResendStatus("error");
      setResendMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
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
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yaaq-gold/10">
                <Mail className="h-8 w-8 text-yaaq-gold" aria-hidden="true" />
              </div>

              <h1 className="font-display text-2xl font-bold text-foreground">Check Your Email</h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We&apos;ve sent a verification link to your email address.
              </p>
              {email && (
                <p className="mt-2 font-medium text-foreground break-all">{email}</p>
              )}

              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">What to do next:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your email inbox</li>
                  <li>Find the email from YAAQ World</li>
                  <li>Click the verification link</li>
                  <li>Return here to sign in</li>
                </ol>
                <p className="text-xs mt-3">
                  Can&apos;t find the email? Check your spam or junk folder.
                </p>
              </div>

              {resendStatus === "success" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600" role="status">
                  <CheckCircle className="h-4 w-4" />
                  <span>{resendMessage}</span>
                </div>
              )}
              {resendStatus === "error" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <span>{resendMessage}</span>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleResend}
                  variant="gold"
                  className="w-full"
                  isLoading={isResending}
                  disabled={!email}
                >
                  Resend Verification Email
                </Button>

                <Link href="/auth/login">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Return to Sign In
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                The verification link expires after 24 hours. Request a new one if it has expired.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
