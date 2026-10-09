"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import { getRpcError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, LogIn, ShieldCheck, XCircle } from "lucide-react";

type Status = "loading" | "ready" | "accepted" | "error" | "unauthenticated" | "unconfigured";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const run = async () => {
      if (!isSupabaseConfigured()) {
        setStatus("unconfigured");
        return;
      }
      if (!token || token.length < 32) {
        setStatus("error");
        setMessage("This invitation link is not valid.");
        return;
      }
      if (!user) {
        setStatus("unauthenticated");
        return;
      }

      const supabase = getBrowserClient();
      const { error: rpcError } = await supabase.rpc("accept_admin_invitation", {
        p_token: token,
      });

      if (rpcError) {
        setStatus("error");
        setMessage(getRpcError(rpcError));
        return;
      }

      setStatus("accepted");
    };

    run();
  }, [authLoading, token, user]);

  const goToAdmin = () => {
    router.push("/admin");
    router.refresh();
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
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 sm:p-8 text-center space-y-5">
              {status === "loading" && (
                <div className="space-y-3" aria-live="polite">
                  <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                  <Skeleton className="mx-auto h-5 w-56" />
                  <Skeleton className="mx-auto h-4 w-40" />
                </div>
              )}

              {status === "accepted" && (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      Administrator access granted
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You now have administrative access to YAAQ World. Head to the admin area to
                      get started.
                    </p>
                  </div>
                  <Button variant="gold" size="lg" className="w-full gap-2" onClick={goToAdmin}>
                    <ShieldCheck className="h-4 w-4" />
                    Open Admin Area
                  </Button>
                </>
              )}

              {status === "unauthenticated" && (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yaaq-gold/10 text-yaaq-gold-ink">
                    <LogIn className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      Sign in to accept
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Sign in with the invited email address to accept this administrator
                      invitation. The link stays valid after you sign in.
                    </p>
                  </div>
                  <Link href={`/auth/login?redirect=${encodeURIComponent(`/auth/accept-invitation?token=${token ?? ""}`)}`} className="block">
                    <Button variant="gold" size="lg" className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}

              {(status === "error" || status === "unconfigured") && (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <XCircle className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      {status === "unconfigured" ? "Configuration required" : "Invitation unavailable"}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground" role="alert">
                      {status === "unconfigured"
                        ? "Supabase is not configured for this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
                        : message}
                    </p>
                  </div>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      Back to home
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
