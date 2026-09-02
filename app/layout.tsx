import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { brand } from "@/content/site";
import { env } from "@/lib/env";
import Analytics from "@/components/Analytics";

/**
 * One typeface across the whole site. Hierarchy comes from weight, size and
 * tracking rather than from mixing families, which keeps the page calm and
 * cuts the webfont payload to a single variable file.
 *
 * To swap it: change the import and the constructor here. Nothing else in the
 * codebase names a font. Good alternatives with the same character set and
 * weight range: Plus_Jakarta_Sans (warmer), Figtree (softer), Outfit (more
 * geometric).
 */
const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Validated in lib/env.ts, so metadataBase can never throw during the build.
const siteUrl = env.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: brand.seoTitle,
  description: brand.seoDescription,
  openGraph: {
    title: brand.seoTitle,
    description: brand.seoDescription,
    url: siteUrl,
    siteName: brand.name,
    images: [{ url: brand.ogImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.seoTitle,
    description: brand.seoDescription,
    images: [brand.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
