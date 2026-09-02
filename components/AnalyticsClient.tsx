"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { captureAttribution } from "@/lib/checkout";

/**
 * Captures UTM attribution once per hard load, then fires page_view and
 * watches scroll depth for scroll_50 and scroll_90 (each fired at most once
 * per route). Keyed on the pathname so client-side navigations to the legal
 * pages and back are counted too.
 */
export default function AnalyticsClient() {
  const pathname = usePathname();

  // UTM/click ids only exist on the landing URL; capture once per hard load.
  useEffect(() => {
    captureAttribution();
  }, []);

  // One page_view and a fresh set of scroll-depth flags per route.
  useEffect(() => {
    track("page_view", { path: pathname });

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
  }, [pathname]);

  return null;
}
