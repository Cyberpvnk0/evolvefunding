"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface FadeUpProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  /** Pixels to travel. */
  distance?: number;
  /** Animate once (default) or every time it enters. */
  once?: boolean;
}

/**
 * Fade + rise on scroll into view. Expensive-feeling ease, nothing bouncy.
 * With prefers-reduced-motion it snaps to its final state on mount.
 *
 * The markup must not fork on `reduce`: the server always renders `initial`
 * (opacity 0), and React does not patch style mismatches on hydration, so a
 * reduced-motion client has to animate that inline style away itself. Under
 * reduce we run a zero-duration `animate` on mount instead of `whileInView`.
 *
 * Do not wrap above-the-fold hero content in this. Use CSS `.reveal` classes
 * there so the first paint does not wait for hydration.
 */
export default function FadeUp({
  children,
  delay = 0,
  distance = 24,
  once = true,
  ...rest
}: FadeUpProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={reduce ? { opacity: 1, y: 0 } : undefined}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
