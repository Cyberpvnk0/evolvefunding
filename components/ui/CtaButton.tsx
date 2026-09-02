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
 * The one checkout button. Solid champagne gold, ink text, no gradient.
 *
 * Renders as a real <a> so it works before hydration. The href starts as the
 * base checkout URL and is upgraded with the visitor's UTM params after mount
 * so server and client markup match. The params are read straight from the
 * landing URL (captureAttribution is idempotent) rather than from storage, so
 * the first ad-click visit carries them regardless of effect order.
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
    track("checkout_redirect", { section, url: href });
  };

  return (
    <a
      href={href}
      onClick={onClick}
      data-cta={section}
      className={cn(
        "inline-flex items-center justify-center select-none whitespace-nowrap",
        "bg-gold text-ink font-sans font-semibold tracking-[0.01em] rounded-[3px]",
        "transition-[background-color,transform] duration-200 ease-expensive",
        "hover:bg-gold-deep active:scale-[0.985]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        size === "lg" ? "h-14 px-8 text-[16px]" : "h-11 px-5 text-[14px]",
        block && "w-full",
        className,
      )}
    >
      {label}
    </a>
  );
}
