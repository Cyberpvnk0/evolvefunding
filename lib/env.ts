/**
 * Public environment variables. Read once, typed, with safe fallbacks.
 * Anything prefixed NEXT_PUBLIC_ is inlined into the client bundle at build time.
 */
export const env = {
  /** Stripe Payment Link. Every CTA goes here. */
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://evolvefunding.com",
} as const;
