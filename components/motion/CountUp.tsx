"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface CountUpProps {
  from: number;
  to: number;
  /** Milliseconds. */
  durationMs?: number;
  /** Start when scrolled into view instead of on mount. */
  startOnView?: boolean;
  /** Render with en-US thousands separators, e.g. 1,200. */
  thousands?: boolean;
  className?: string;
}

/**
 * Animates a number from `from` to `to` with a cubic ease-out.
 * Server renders `from`; the client counts up after mount (or on view).
 * With prefers-reduced-motion it jumps straight to `to`.
 */
export default function CountUp({
  from,
  to,
  durationMs = 2000,
  startOnView = false,
  thousands = false,
  className,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const run = () => {
      if (started.current) return;
      started.current = true;

      if (reduce) {
        setValue(to);
        return;
      }

      let raf = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(from + (to - from) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };

    if (!startOnView) return run();

    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return run();

    // run() returns the rAF canceller; hold it so unmounting mid-count stops
    // the loop instead of leaving it to tick against an unmounted component.
    let stopCount: (() => void) | void;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          stopCount = run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopCount?.();
    };
  }, [from, to, durationMs, reduce, startOnView]);

  const fmt = (n: number) => (thousands ? n.toLocaleString("en-US") : String(n));

  // Instrument Serif ships no tabular figures, so `.tabular` is inert and the
  // digits have different advance widths ("1" is much narrower than "0").
  // Two things follow from that:
  //
  //  1. Each digit is boxed to 1ch, which the CSS spec defines as the advance
  //     width of "0". Every digit then occupies the same width, so the number
  //     never jitters mid-count and, at rest, it measures exactly as wide as
  //     the all-zero ghost below (no gap before whatever follows it).
  //  2. A hidden ghost of the widest value reserves the final width up front,
  //     so a count whose digit count grows (0 to 1,200) never pushes the text
  //     beside it sideways.
  //
  // Both layers are hidden from assistive tech; a visually hidden span
  // announces the final value, whatever frame the animation is on.
  const longest = fmt(from).length > fmt(to).length ? fmt(from) : fmt(to);
  const ghost = longest.replace(/\d/g, "0");
  const boxed = (text: string) =>
    text.split("").map((char, i) =>
      /\d/.test(char) ? (
        <span key={i} className="inline-block w-[1ch] text-center">
          {char}
        </span>
      ) : (
        <span key={i}>{char}</span>
      ),
    );

  return (
    <span ref={ref} className={cn("tabular inline-grid", className)}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {boxed(ghost)}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {boxed(fmt(value))}
      </span>
      <span className="sr-only select-none">{fmt(to)}</span>
    </span>
  );
}
