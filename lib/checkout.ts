import { env } from "@/lib/env";

/**
 * UTM parameters we forward from the landing URL to the CTA destination.
 * Captured on first load and stored for the session, so the visitor can scroll,
 * open the lightbox, or refresh and still carry their attribution to checkout.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "ttclid",
  "gclid",
] as const;

const STORAGE_KEY = "ef_attribution";

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function readStored(): Attribution {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

/**
 * Capture UTM and click-id params from the current URL and persist them.
 * Idempotent: params in the URL win over anything previously stored, and the
 * merged result is written back, so it is safe to call from every consumer
 * (AnalyticsClient on load, each CtaButton on mount) in any effect order.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }
  const merged = { ...readStored(), ...fromUrl };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* private mode */
  }
  return merged;
}

/** Return the stored attribution without touching the URL. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  return readStored();
}

/**
 * Build the destination for a CTA: the URL in NEXT_PUBLIC_CHECKOUT_URL, with
 * the visitor's UTM params carried over and a `ref` param naming the section
 * that sent them, so whatever receives the click can attribute it.
 *
 * Returns "" when no destination is configured. Callers must handle that:
 * CtaButton renders an inert button rather than a dead link. Nothing here
 * throws, so a malformed value can never break a render or the build.
 */
export function buildCheckoutUrl(section: string, attribution?: Attribution): string {
  const base = env.checkoutUrl;
  if (!base) return "";

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    // Not an absolute URL. Pass it through untouched so a relative path or a
    // mailto:/sms: link still works; we just cannot append params to it.
    return base;
  }

  const attr = attribution ?? getAttribution();
  for (const [key, value] of Object.entries(attr)) {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  if (!url.searchParams.has("ref")) url.searchParams.set("ref", section);
  return url.toString();
}
