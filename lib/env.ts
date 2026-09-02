/**
 * Public environment variables. Read once, typed, blank-safe.
 *
 * Anything prefixed NEXT_PUBLIC_ is inlined into the client bundle at build
 * time. Each `process.env.NEXT_PUBLIC_*` below is written out in full so that
 * inlining works; passing the reference through a helper is fine, but building
 * the key dynamically would not be.
 *
 * A variable that exists but is EMPTY is treated as unset. Hosting dashboards
 * (Vercel included) happily store a blank value, and `??` only falls back on
 * undefined, so a blank var would otherwise reach code expecting a real one.
 */

const DEFAULT_SITE_URL = "https://evolvefundingllc.com";

/** Trim a value and treat blank or whitespace-only as unset. */
function read(value: string | undefined, fallback = ""): string {
  return (value ?? "").trim() || fallback;
}

/**
 * Normalize a site URL: accept a bare domain, require http(s), drop any
 * trailing slash, and fall back rather than throw. `new URL()` throwing here
 * would fail the production build during page collection, since metadataBase
 * is evaluated for every route.
 */
function siteUrlFrom(value: string): string {
  const raw = read(value, DEFAULT_SITE_URL);
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const env = {
  /**
   * Where every CTA sends the visitor. Provider-neutral: an order form, a
   * hosted checkout, a landing page, anything with a URL.
   * Unset is supported — the buttons render but stay inert.
   */
  checkoutUrl: read(process.env.NEXT_PUBLIC_CHECKOUT_URL),
  metaPixelId: read(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  tiktokPixelId: read(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
  ga4Id: read(process.env.NEXT_PUBLIC_GA4_ID),
  /** Always a valid absolute origin with no trailing slash. Never throws. */
  siteUrl: siteUrlFrom(read(process.env.NEXT_PUBLIC_SITE_URL)),
} as const;
