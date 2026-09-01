"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { proof, type ProofClient } from "@/content/site";

interface ProofLightboxProps {
  /** Client whose score screenshot is shown. `null` closes the dialog. */
  client: ProofClient | null;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Score screenshot lightbox for the proof wall.
 *
 * Portalled to <body> so a transformed ancestor (a FadeUp mid-animation) can
 * never turn `fixed` into `absolute`. role="dialog" + aria-modal. Escape, the
 * close button, and a tap anywhere off the image all close it. Focus lands on
 * the close button on open and Tab stays inside; the gallery hands focus back
 * to the card that opened it. Body scroll is locked while open. 0.25s fade,
 * instant with prefers-reduced-motion.
 */
export default function ProofLightbox({ client, onClose }: ProofLightboxProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = client !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      // Keep Tab inside the dialog.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Server and first client render both draw nothing, so hydration matches.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {client && (
        <motion.div
          key="proof-lightbox"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="proof-lightbox-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
          onClick={(e) => {
            // Anything that is not the screenshot or the close button is backdrop.
            if (e.target instanceof Element && !e.target.closest("img, button")) onClose();
          }}
          className="fixed inset-0 z-50 flex flex-col overscroll-none bg-ink/95"
        >
          {/* Top bar: reserves room so the close button never sits on the screenshot. */}
          <div className="flex shrink-0 justify-end px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-4">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-[3px] text-bone/70 transition-colors duration-200 ease-expensive hover:text-bone"
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="round"
              >
                <path d="M4 4l14 14M18 4L4 18" />
              </svg>
            </button>
          </div>

          <figure className="mx-auto flex min-h-0 w-[92vw] flex-1 flex-col justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:w-[480px]">
            <div className="relative max-h-[86svh] min-h-0 w-full flex-1">
              <Image
                src={client.scoreShot}
                alt={`${proof.lightboxHint} for ${client.name}`}
                fill
                sizes="(min-width:640px) 480px, 92vw"
                quality={80}
                className="object-contain"
              />
            </div>

            <figcaption className="shrink-0 pt-4 text-center">
              <p id="proof-lightbox-title" className="font-sans text-[14px] font-medium text-bone">
                {client.name}
              </p>
              <p className="mt-1.5 flex items-baseline justify-center gap-x-1.5">
                <span className="eyebrow">Before</span>
                <span className="font-display text-[24px] leading-none text-gold tabular">{client.before}</span>
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-mute"
                >
                  <path d="M1.5 7h11M8.5 3l4 4-4 4" />
                </svg>
                <span className="eyebrow">After</span>
                <span className="font-display text-[24px] leading-none text-gold tabular">{client.after}</span>
              </p>
              <p className="eyebrow mt-2">{proof.lightboxHint}</p>
            </figcaption>
          </figure>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
