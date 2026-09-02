/**
 * Lightweight analytics wrapper.
 *
 * One `track()` call fans out to whichever pixels are configured:
 *   - Meta Pixel   (window.fbq)
 *   - TikTok Pixel (window.ttq)
 *   - GA4          (window.gtag)
 *
 * Pixel scripts are injected by <Analytics /> only when the matching env var
 * is set. If a pixel is missing, its call is skipped silently. In development
 * every event is also logged to the console so you can verify the funnel.
 */

export type AnalyticsEvent =
  | "page_view"
  | "scroll_50"
  | "scroll_90"
  | "cta_click"
  | "checkout_redirect"
  | "lead_submit"
  | "vsl_play"
  | "vsl_progress"
  | "vsl_complete";

export type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void; page?: () => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Map our event names to each pixel's preferred standard event. */
const META_EVENT: Partial<Record<AnalyticsEvent, string>> = {
  page_view: "PageView",
  checkout_redirect: "InitiateCheckout",
  lead_submit: "Lead",
  vsl_play: "ViewContent",
};

const TIKTOK_EVENT: Partial<Record<AnalyticsEvent, string>> = {
  checkout_redirect: "InitiateCheckout",
  lead_submit: "SubmitForm",
  vsl_play: "ViewContent",
};

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

export function track(event: AnalyticsEvent, params: EventParams = {}): void {
  if (!isBrowser) return;

  const payload = { ...params };

  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, payload);
  }

  // --- Meta -----------------------------------------------------------------
  try {
    if (window.fbq) {
      const std = META_EVENT[event];
      if (std) {
        window.fbq("track", std, payload);
      } else {
        window.fbq("trackCustom", event, payload);
      }
    }
  } catch {
    /* pixel blocked or not ready */
  }

  // --- TikTok ---------------------------------------------------------------
  try {
    if (window.ttq) {
      if (event === "page_view") {
        window.ttq.page?.();
      } else {
        window.ttq.track(TIKTOK_EVENT[event] ?? event, payload);
      }
    }
  } catch {
    /* pixel blocked or not ready */
  }

  // --- GA4 ------------------------------------------------------------------
  try {
    if (window.gtag) {
      window.gtag("event", event, payload);
    }
  } catch {
    /* pixel blocked or not ready */
  }
}
