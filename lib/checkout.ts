import { env } from "@/lib/env";

/**
 * UTM parameters we forward from the landing URL to the Stripe Payment Link.
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
 * Capture UTM and click-id params from the current URL. Call once on mount.
 * Params in the URL win over anything previously stored.
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
 * Build the checkout URL for a CTA. Always the same base (from env), with the
 * visitor's UTM params appended plus a `ref` param naming the section that
 * sent them, so you can see in Stripe which CTA converts.
 */
export function buildCheckoutUrl(section: string, attribution?: Attribution): string {
  const base = env.checkoutUrl;
  if (!base) return "#checkout-url-not-set";

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }

  const attr = attribution ?? getAttribution();
  for (const [key, value] of Object.entries(attr)) {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  url.searchParams.set("ref", section);
  return url.toString();
}
