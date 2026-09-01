"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/checkout";
import { brand, exitIntent } from "@/content/site";

type LeadSource = "exit_intent" | "timer";
type Status = "idle" | "submitting" | "sent" | "error";

/** Session flags. Either one set means the slide-up never shows again this session. */
const DISMISSED_KEY = "ef_exit_dismissed";
const SENT_KEY = "ef_lead_sent";
/** How long to wait before trying again when another dialog is already open. */
const RETRY_MS = 10_000;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Slide up from below the viewport. */
const slide: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
};

/** Reduced motion: no travel, just on and off. */
const toggle: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function hasFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function setFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* private mode */
  }
}

/** Digits only, keeping a leading "+" so international numbers survive. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return (raw.trim().startsWith("+") ? "+" : "") + digits;
}

/**
 * EXIT INTENT / TIMER SLIDE-UP. One phone field, "Text Me". Not a checkout.
 *
 * Desktop (fine pointer, >= 1024px): shows when the cursor leaves through the
 * top of the viewport. Everything else: shows after `exitIntent.mobileDelayMs`.
 * At most once per page load, never after it has been dismissed or a lead has
 * been sent this session, and never on top of another open dialog (it waits
 * ten seconds and tries again).
 *
 * Portalled to <body> so a transformed ancestor can never turn `fixed` into
 * `absolute`. Slides up from the bottom edge (a fade with reduced motion) over
 * a dim backdrop that closes on tap. role="dialog" + aria-modal; focus lands on
 * the input, Tab stays inside, Escape closes, and focus returns to wherever it
 * was. Body scroll is locked while open.
 *
 * Submits to /api/lead, which forwards to the GHL webhook server-side.
 */
export default function ExitIntent() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const sourceRef = useRef<LeadSource>("timer");
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setFlag(DISMISSED_KEY);
    setOpen(false);
    const opener = openerRef.current;
    openerRef.current = null;
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  }, []);

  // Arm the trigger: mouseleave through the top on desktop, a timer elsewhere.
  useEffect(() => {
    if (hasFlag(DISMISSED_KEY) || hasFlag(SENT_KEY)) return;

    const desktop = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;
    let timer: number | undefined;
    let done = false;

    const teardown = () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.clearTimeout(timer);
    };

    const attempt = (source: LeadSource) => {
      if (done) return;
      if (hasFlag(DISMISSED_KEY) || hasFlag(SENT_KEY)) {
        done = true;
        teardown();
        return;
      }
      // Another dialog (the proof lightbox) is open. Re-arm and try again later.
      if (document.querySelector('[aria-modal="true"]')) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => attempt(source), RETRY_MS);
        return;
      }
      done = true;
      teardown();
      sourceRef.current = source;
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) attempt("exit_intent");
    };

    if (desktop) {
      document.addEventListener("mouseleave", onMouseLeave);
    } else {
      timer = window.setTimeout(() => attempt("timer"), exitIntent.mobileDelayMs);
    }

    return teardown;
  }, []);

  // While open: lock scroll, focus the input, handle Escape and keep Tab inside.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

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
  }, [open, close]);

  // The input unmounts on success; hand focus to the close button so it is not lost.
  useEffect(() => {
    if (status === "sent") closeRef.current?.focus({ preventScroll: true });
  }, [status]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, "").length;
    if (digits < 10 || digits > 15) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    const source = sourceRef.current;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          source,
          path: window.location.pathname,
          utm: getAttribution(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setFlag(SENT_KEY);
      track("lead_submit", { source });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  // Server and first client render both draw nothing, so hydration matches.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="exit-intent-backdrop"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
          onClick={close}
          className="fixed inset-0 z-[60] bg-ink/60"
        />
      )}
      {open && (
        <motion.div
          key="exit-intent-panel"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
          variants={reduce ? toggle : slide}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          className="pb-safe fixed inset-x-0 bottom-0 z-[60] max-h-[90svh] overflow-y-auto rounded-t-[6px] border-t border-line bg-ink-2 sm:mx-auto sm:max-w-lg sm:border-x"
        >
          <div className="relative px-5 pb-6 pt-5">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-[3px] text-bone/70 transition-colors duration-200 ease-expensive hover:text-bone"
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

            <p className="eyebrow">{brand.name}</p>
            <h2
              id="exit-intent-title"
              className="mt-3 pr-10 font-display text-[26px] leading-snugger tracking-tightest text-bone sm:text-3xl"
            >
              {exitIntent.headline}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-mute">{exitIntent.body}</p>

            {status === "sent" ? (
              <p role="status" className="mt-6 flex items-center gap-2 text-[15px] text-bone">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                {exitIntent.success}
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="exit-intent-phone" className="sr-only">
                    {exitIntent.placeholder}
                  </label>
                  <input
                    ref={inputRef}
                    id="exit-intent-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    placeholder={exitIntent.placeholder}
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "exit-intent-error" : undefined}
                    // 16px so iOS does not zoom the page when the field is focused.
                    className="h-12 w-full min-w-0 flex-1 rounded-[3px] border border-line bg-ink px-4 text-[16px] text-bone placeholder:text-mute/70 focus:border-gold focus:shadow-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex h-12 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-[3px] bg-gold px-6 font-sans text-[16px] font-semibold tracking-[0.01em] text-ink transition-[background-color,opacity] duration-200 ease-expensive hover:bg-gold-deep disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-gold"
                  >
                    {exitIntent.button}
                  </button>
                </div>

                {status === "error" && (
                  <p id="exit-intent-error" role="alert" className="mt-2 text-[13px] text-bone">
                    {exitIntent.error}
                  </p>
                )}

                <p className="mt-3 text-[11px] leading-snug text-mute/70">{exitIntent.consent}</p>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
