import { ReactNode } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creator Studio",
  robots: { index: false, follow: false },
};

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
