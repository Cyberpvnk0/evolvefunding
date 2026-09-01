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

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [from, to, durationMs, reduce, startOnView]);

  return (
    <span ref={ref} className={cn("tabular", className)} aria-label={String(to)}>
      {value}
    </span>
  );
}
