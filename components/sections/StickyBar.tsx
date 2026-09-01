"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import { cn } from "@/lib/cn";
import { stickyBar } from "@/content/site";

type Edge = "top" | "bottom";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Slide + fade from whichever screen edge the bar is pinned to. */
const slide: Variants = {
  hidden: (edge: Edge) => ({ y: edge === "top" ? "-100%" : "100%", opacity: 0 }),
  visible: { y: 0, opacity: 1 },
};

/** Reduced motion: no travel, just on and off. */
const toggle: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * 2. STICKY CTA BAR. Price line on the left, gold checkout button on the right.
 * Pinned to the bottom on phones (thumb reach, safe-area aware) and to the top
 * from `sm` up.
 *
 * Hidden while the hero is on screen, slides in once the visitor scrolls past
 * it, and slides out again while the final CTA section is on screen so the two
 * checkout buttons never stack. Driven by IntersectionObserver on `#hero` and
 * `#final-cta`; browsers without it show the bar after one viewport of scroll.
 */
export default function StickyBar() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(false);
  const [edge, setEdge] = useState<Edge>("bottom");

  // Which edge we are pinned to (Tailwind `sm`), so the slide direction matches.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setEdge(mq.matches ? "top" : "bottom");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Visibility: past the hero and not over the final CTA. Any visible pixel counts.
  useEffect(() => {
    const hero = document.getElementById("hero");
    const final = document.getElementById("final-cta");
    const hasIO = typeof IntersectionObserver !== "undefined";

    let heroPassed = false;
    let finalInView = false;
    const update = () => setShown(heroPassed && !finalInView);
    const cleanups: Array<() => void> = [];

    if (hasIO && (hero || final)) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.target === hero) heroPassed = !e.isIntersecting;
          else if (e.target === final) finalInView = e.isIntersecting;
        }
        update();
      });
      if (hero) io.observe(hero);
      if (final) io.observe(final);
      cleanups.push(() => io.disconnect());
    }

    // No IntersectionObserver (or no hero to watch): one viewport of scroll.
    if (!hasIO || !hero) {
      const onScroll = () => {
        heroPassed = window.scrollY > window.innerHeight;
        update();
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    // The wrapper stays mounted so aria-hidden is true during the exit animation too.
    <div
      aria-hidden={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 sm:bottom-auto sm:top-0",
        !shown && "pointer-events-none",
      )}
    >
      <AnimatePresence custom={edge}>
        {shown && (
          <motion.div
            key="sticky-bar"
            custom={edge}
            variants={reduce ? toggle : slide}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            className="pb-safe border-t border-line bg-ink/90 backdrop-blur-md sm:border-b sm:border-t-0 sm:pb-0"
          >
            <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
              <p className="flex min-w-0 items-center gap-2 text-[13px] text-bone sm:text-[14px]">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span className="truncate">{stickyBar.left}</span>
              </p>
              <CtaButton section="sticky_bar" size="md" label={stickyBar.cta} className="shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
