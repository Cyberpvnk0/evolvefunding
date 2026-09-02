"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { buildCheckoutUrl, captureAttribution } from "@/lib/checkout";
import { cn } from "@/lib/cn";

interface CtaButtonProps {
  /** Section name for analytics, e.g. "hero", "sticky_bar", "final". */
  section: string;
  label: string;
  size?: "lg" | "md";
  /** Stretch to the container width. Default true on mobile via className. */
  block?: boolean;
  className?: string;
}

/**
 * The one CTA button. Solid champagne gold, ink text, no gradient.
 *
 * With a destination configured (NEXT_PUBLIC_CHECKOUT_URL) it renders a real
 * <a>, so it works before hydration. The href starts as the bare destination
 * and is upgraded with the visitor's UTM params after mount, so server and
 * client markup match. Params are read straight from the landing URL
 * (captureAttribution is idempotent) rather than from storage, so the first
 * ad-click visit carries them regardless of effect order.
 *
 * With no destination configured it renders a <button> instead: identical
 * styling, still keyboard reachable, still fires analytics, but no dead link.
 * That keeps the page honest until a checkout destination is chosen.
 */
export default function CtaButton({
  section,
  label,
  size = "lg",
  block = false,
  className,
}: CtaButtonProps) {
  const [href, setHref] = useState(() => buildCheckoutUrl(section, {}));

  useEffect(() => {
    setHref(buildCheckoutUrl(section, captureAttribution()));
  }, [section]);

  const onClick = () => {
    track("cta_click", { section });
    if (href) track("checkout_redirect", { section, url: href });
    else if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[cta] No destination configured. Set NEXT_PUBLIC_CHECKOUT_URL to send "${section}" somewhere.`,
      );
    }
  };

  const classes = cn(
    "inline-flex items-center justify-center select-none whitespace-nowrap",
    "cta-glow bg-gold text-ink font-sans font-bold tracking-[0.01em] rounded-[3px]",
    "transition-[background-color,transform] duration-200 ease-expensive",
    "hover:bg-gold-deep active:scale-[0.985]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
    size === "lg" ? "h-14 px-8 text-[16px]" : "h-11 px-5 text-[14px]",
    block && "w-full",
    className,
  );

  if (!href) {
    return (
      <button type="button" onClick={onClick} data-cta={section} className={classes}>
        {label}
      </button>
    );
  }

  return (
    <a href={href} onClick={onClick} data-cta={section} className={classes}>
      {label}
    </a>
  );
}
