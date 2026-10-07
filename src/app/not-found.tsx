import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "Sorry, the page you're looking for doesn't exist.",
  robots: "noindex",
};

export default function NotFound() {
  return (
    <MainLayout>
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-9xl font-bold text-yaaq-gold/20">404</h1>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved
            or doesn't exist.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="gold" className="gap-2">
                <Home className="h-5 w-5" />
                Back to Home
              </Button>
            </Link>
            <Link href="/news">
              <Button size="lg" variant="outline" className="gap-2">
                <Search className="h-5 w-5" />
                Browse News
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}