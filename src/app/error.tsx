"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <MainLayout>
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h1 className="font-display text-3xl font-bold text-foreground">Something went wrong</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We encountered an unexpected error. Please try again, or return home and retry.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} variant="gold" className="gap-2">
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}