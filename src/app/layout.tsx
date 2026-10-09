import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yaaqworld.com"),
  title: {
    default: "YAAQ World — The Pulse of Ghanaian Campus Culture & Creative Storytelling",
    template: "%s | YAAQ World",
  },
  description:
    "YAAQ World is a Ghanaian campus media production and creative storytelling brand capturing people, moments, events, and experiences shaping Ghanaian campus culture. Photography, videography, event coverage, and creative content production.",
  keywords: [
    "YAAQ World",
    "Ghana campus media",
    "student storytelling",
    "event photography",
    "videography Ghana",
    "campus culture",
    "creative production",
    "media partnerships",
    "Koforidua Technical University",
    "KTU media",
  ],
  authors: [{ name: "YAAQ World" }],
  creator: "YAAQ World",
  publisher: "YAAQ World",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "/",
    siteName: "YAAQ World",
    title: "YAAQ World — The Pulse of Ghanaian Campus Culture & Creative Storytelling",
    description:
      "YAAQ World captures the people, moments, events, and stories shaping Ghanaian campus culture through professional media production and creative storytelling.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "YAAQ World — Campus Culture & Creative Storytelling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAAQ World — The Pulse of Ghanaian Campus Culture",
    description:
      "Capturing Ghanaian campus culture through professional media production and creative storytelling.",
    images: ["/images/og-default.jpg"],
    creator: "@yaaqworld",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yaaqworld.com";
  const sameAs = [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    process.env.NEXT_PUBLIC_TWITTER_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
  ].filter((url): url is string => Boolean(url));

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "YAAQ World",
        url: siteUrl,
        foundingDate: "2026",
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "YAAQ World",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en-GH" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}