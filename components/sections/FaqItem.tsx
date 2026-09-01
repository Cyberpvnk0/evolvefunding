"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface FaqItemProps {
  /** Base for the button and panel ids, e.g. "faq-1". */
  id: string;
  question: string;
  answer: string;
}

/**
 * One accordion row: the question as a full-width serif button with a plus
 * glyph on the right, and the answer unfolding beneath it.
 *
 * Closed by default and independent of its siblings. The panel is mounted
 * only while open so its height can animate from 0 to auto; with
 * prefers-reduced-motion it simply appears and disappears. The glyph turns
 * 45 degrees into a cross when open (CSS transition, also reduced globally).
 */
export default function FaqItem({ id, question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  const answerBody = (
    <p className="max-w-prose pb-6 text-[15px] leading-relaxed text-mute sm:text-base">{answer}</p>
  );

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left"
        >
          <span className="font-display text-[22px] leading-snugger tracking-tightest text-bone sm:text-2xl">
            {question}
          </span>
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            className={cn(
              "shrink-0 text-mute transition-[transform,color] duration-300 ease-expensive group-hover:text-bone",
              open && "rotate-45",
            )}
          >
            <path d="M10 3.5v13M3.5 10h13" />
          </svg>
        </button>
      </h3>

      {reduce ? (
        open && (
          <div id={panelId} role="region" aria-labelledby={buttonId}>
            {answerBody}
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {answerBody}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
