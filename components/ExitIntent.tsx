"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/checkout";
import { brand, exitIntent } from "@/content/site";

type LeadSource = "exit_intent" | "timer";
type Status = "idle" | "submitting" | "sent" | "error";
type ErrorField = "firstName" | "lastName" | "phone" | "send" | null;

/** Session flags. Either one set means the slide-up never shows again this session. */
const DISMISSED_KEY = "ef_exit_dismissed";
const SENT_KEY = "ef_lead_sent";
/** How long to wait before trying again when a dialog is already open. */
const RETRY_MS = 10_000;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Shared input styling. 16px text stops iOS zooming the page on focus. */
const FIELD =
  "h-12 w-full min-w-0 rounded-[3px] border border-line bg-ink px-4 text-[16px] text-bone placeholder:text-mute focus:border-gold focus:shadow-gold focus:outline-none";

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
 * been sent this session, and never on top of an open dialog (it waits ten
 * seconds and tries again).
 *
 * A sheet, not a popup: no backdrop, no scroll lock, no focus trap. The page
 * stays usable behind it. Portalled to <body> so a transformed ancestor can
 * never turn `fixed` into `absolute`. Slides up from the bottom edge (a fade
 * with reduced motion) inside a polite live region that is mounted ahead of
 * time, so screen readers hear it appear. role="region", labelled by its
 * headline. On desktop exit intent focus lands on the input (the cursor has
 * already left the page); on the mobile timer focus stays where it is, so
 * nothing is stolen mid-scroll and Android does not raise the keyboard
 * unasked. Close button or Escape dismisses; focus goes back to where it was
 * only if it was inside the sheet.
 *
 * Sits under the sticky bar (z-30 < z-40). While that bar is mounted on
 * phones, the sheet reserves the bar's height in bottom padding so Start Now
 * stays reachable above the fold of the sheet.
 *
 * Submits to /api/lead, which forwards to the GHL webhook server-side.
 */
export default function ExitIntent() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  /** Which field failed validation, or "send" when the request itself failed. */
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const sourceRef = useRef<LeadSource>("timer");
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setFlag(DISMISSED_KEY);
    setOpen(false);
    const opener = openerRef.current;
    openerRef.current = null;
    // Hand focus back only when it is inside the sheet and about to be lost with it.
    const inside = panelRef.current?.contains(document.activeElement) ?? false;
    if (inside && opener && document.contains(opener)) opener.focus({ preventScroll: true });
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
      // A dialog (the proof lightbox) is open. Re-arm and try again later.
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

  // While open: focus the input on desktop exit intent only, and close on Escape.
  useEffect(() => {
    if (!open) return;

    // Timer path (touch devices): leave focus alone. A programmatic focus would
    // steal it mid-scroll and raise the soft keyboard on Android without a tap.
    if (sourceRef.current === "exit_intent") inputRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // A real dialog on top (the proof lightbox) owns Escape while it is open.
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // The input unmounts on success; hand focus to the close button so it is not lost.
  useEffect(() => {
    if (status === "sent") closeRef.current?.focus({ preventScroll: true });
  }, [status]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    // Validate in reading order and focus the field that needs fixing, so the
    // message always points at something the visitor can act on.
    const first = firstName.trim();
    const last = lastName.trim();
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, "").length;

    if (!first) {
      setStatus("error");
      setErrorField("firstName");
      inputRef.current?.focus();
      return;
    }
    if (!last) {
      setStatus("error");
      setErrorField("lastName");
      lastNameRef.current?.focus();
      return;
    }
    if (digits < 10 || digits > 15) {
      setStatus("error");
      setErrorField("phone");
      phoneRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setErrorField(null);
    const source = sourceRef.current;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: first,
          lastName: last,
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
      setErrorField("send");
    }
  };

  // Server and first client render both draw nothing, so hydration matches.
  if (!mounted) return null;

  return createPortal(
    // The live region exists before the sheet does, so its arrival is announced.
    <div aria-live="polite">
      <AnimatePresence>
        {open && (
          <motion.div
            key="exit-intent-panel"
            ref={panelRef}
            role="region"
            aria-labelledby="exit-intent-title"
            variants={reduce ? toggle : slide}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            className="pb-safe fixed inset-x-0 bottom-0 z-30 max-h-[90svh] overflow-y-auto rounded-t-[3px] border-t border-line bg-ink-2 sm:mx-auto sm:max-w-lg sm:border-x"
          >
            {/* On phones, while the sticky bar is mounted, its 56px sits over this padding. */}
            <div className="relative px-5 pb-6 pt-5 transition-[padding-bottom] duration-500 ease-expensive motion-reduce:transition-none max-sm:[body:has([data-cta^=sticky])_&]:pb-20">
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
                  {/* Names sit side by side even on a 390px screen: two short
                      fields read as one step, where stacking them would make
                      the sheet look like a long form and cost completions. */}
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <label htmlFor="exit-intent-first" className="sr-only">
                        {exitIntent.fields.firstName.label}
                      </label>
                      <input
                        ref={inputRef}
                        id="exit-intent-first"
                        type="text"
                        autoComplete="given-name"
                        name="firstName"
                        placeholder={exitIntent.fields.firstName.placeholder}
                        required
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (status === "error") {
                            setStatus("idle");
                            setErrorField(null);
                          }
                        }}
                        aria-invalid={errorField === "firstName"}
                        aria-describedby={status === "error" ? "exit-intent-error" : undefined}
                        className={FIELD}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <label htmlFor="exit-intent-last" className="sr-only">
                        {exitIntent.fields.lastName.label}
                      </label>
                      <input
                        ref={lastNameRef}
                        id="exit-intent-last"
                        type="text"
                        autoComplete="family-name"
                        name="lastName"
                        placeholder={exitIntent.fields.lastName.placeholder}
                        required
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (status === "error") {
                            setStatus("idle");
                            setErrorField(null);
                          }
                        }}
                        aria-invalid={errorField === "lastName"}
                        aria-describedby={status === "error" ? "exit-intent-error" : undefined}
                        className={FIELD}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <label htmlFor="exit-intent-phone" className="sr-only">
                      {exitIntent.fields.phone.label}
                    </label>
                    <input
                      ref={phoneRef}
                      id="exit-intent-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      name="phone"
                      placeholder={exitIntent.fields.phone.placeholder}
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (status === "error") {
                            setStatus("idle");
                            setErrorField(null);
                          }
                      }}
                      aria-invalid={errorField === "phone"}
                      aria-describedby={status === "error" ? "exit-intent-error" : undefined}
                      className={`${FIELD} sm:flex-1`}
                    />
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex h-12 shrink-0 select-none items-center justify-center whitespace-nowrap rounded-[3px] bg-gold px-6 font-sans text-[16px] font-semibold tracking-[0.01em] text-ink transition-[background-color,opacity] duration-200 ease-expensive hover:bg-gold-deep disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-gold"
                    >
                      {exitIntent.button}
                    </button>
                  </div>

                  {status === "error" && errorField && (
                    <p id="exit-intent-error" role="alert" className="mt-2 text-[13px] text-bone">
                      {exitIntent.errors[errorField]}
                    </p>
                  )}

                  <p className="mt-3 text-[11px] leading-snug text-mute/80">{exitIntent.consent}</p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
