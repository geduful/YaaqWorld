import { ReactNode } from "react";
import { Clock, Mail, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface LegalSection {
  id: string;
  number: number;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-r-xl border-l-4 border-yaaq-gold bg-yaaq-gold/5 px-5 py-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-yaaq-gold-ink [&_a:hover]:underline [&_strong]:text-foreground">
      {children}
    </div>
  );
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  const lastUpdated = new Date().toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout>
      <section className="section-py bg-yaaq-navy text-white relative overflow-hidden" aria-labelledby="legal-heading">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-yaaq-gold/20 via-transparent to-transparent" />
        <div className="relative container-yaaq py-12 lg:py-16">
          <div className="max-w-3xl animate-in stagger-1">
            <Badge variant="gold" className="mb-4 inline-block">
              Legal
            </Badge>
            <h1
              id="legal-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            >
              {title}
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/70">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Last updated {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="section-py bg-background" aria-label={`${title} content`}>
        <div className="container-yaaq">
          <div className="items-start lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12 xl:gap-16">
            <aside className="hidden lg:block sticky top-24 self-start">
              <nav aria-label="On this page">
                <p className="eyebrow mb-4">On this page</p>
                <ol className="space-y-1 border-l border-border">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group -ml-px flex gap-2 border-l border-transparent py-1 pl-4 text-sm text-muted-foreground transition-colors hover:border-yaaq-gold hover:text-foreground"
                      >
                        <span className="font-medium tabular-nums text-yaaq-gold-ink/70 group-hover:text-yaaq-gold-ink">
                          {section.number}.
                        </span>
                        <span className="leading-snug">{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="min-w-0">
              <details className="mb-10 rounded-xl border bg-card lg:hidden">
                <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-foreground">
                  On this page
                </summary>
                <ol className="space-y-1 border-t border-border px-5 py-3">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-yaaq-gold-ink"
                      >
                        {section.number}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>

              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{intro}</p>

              <div className="mt-10 space-y-12">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-heading`}
                    className="scroll-mt-24"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yaaq-gold/15 text-sm font-bold text-yaaq-gold-ink"
                        aria-hidden="true"
                      >
                        {section.number}
                      </span>
                      <h2
                        id={`${section.id}-heading`}
                        className="font-display pt-1 text-xl sm:text-2xl font-semibold leading-snug text-foreground text-balance"
                      >
                        {section.title}
                      </h2>
                    </div>
                    <div className="mt-4 sm:pl-13 prose prose-neutral dark:prose-invert max-w-none">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>

              <Card className="mt-14">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-yaaq-gold-ink" aria-hidden="true" />
                    Koforidua, Eastern Region, Ghana
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-yaaq-gold-ink" aria-hidden="true" />
                    <a href="mailto:yaaqworld@gmail.com" className="text-yaaq-gold-ink hover:underline">
                      yaaqworld@gmail.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
