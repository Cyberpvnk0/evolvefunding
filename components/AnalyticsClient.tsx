"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { captureAttribution } from "@/lib/checkout";

/**
 * Fires page_view once, captures UTM attribution, and watches scroll depth
 * for scroll_50 and scroll_90 (each fired at most once per page load).
 */
export default function AnalyticsClient() {
  useEffect(() => {
    captureAttribution();
    track("page_view", { path: window.location.pathname });

    const fired = { 50: false, 90: false };
    let ticking = false;

    const check = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      if (!fired[50] && pct >= 50) {
        fired[50] = true;
        track("scroll_50");
      }
      if (!fired[90] && pct >= 90) {
        fired[90] = true;
        track("scroll_90");
        window.removeEventListener("scroll", onScroll);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
