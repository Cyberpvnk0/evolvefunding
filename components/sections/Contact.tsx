"use client";

import { useRef, useState, type FormEvent } from "react";
import FadeUp from "@/components/motion/FadeUp";
import SectionHeading from "@/components/ui/SectionHeading";
import { track } from "@/lib/analytics";
import { getAttribution } from "@/lib/checkout";
import { contact } from "@/content/site";

type Field = "firstName" | "lastName" | "email" | "phone" | "message";
type Status = "idle" | "submitting" | "sent" | "error";

const EMPTY: Record<Field, string> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

/** Digits only, keeping a leading "+" so international numbers survive. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return (raw.trim().startsWith("+") ? "+" : "") + digits;
}

/**
 * 8a. CONTACT. The one section on the page that is not a checkout button.
 *
 * Posts to /api/lead with source "contact_form", the same route the
 * exit-intent sheet uses, so both land wherever GHL_WEBHOOK_URL points and
 * neither needs its own plumbing. With that variable unset the route still
 * answers 200, so the form behaves correctly in preview and starts delivering
 * the moment the webhook is configured.
 *
 * Validation runs in reading order and focuses the field at fault, so the
 * message always points at something the visitor can act on rather than
 * reporting a generic failure.
 */
export default function Contact() {
  const [values, setValues] = useState<Record<Field, string>>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorField, setErrorField] = useState<Field | "send" | null>(null);
  const refs: Record<Field, React.RefObject<HTMLInputElement | HTMLTextAreaElement>> = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const set = (field: Field) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (status === "error") {
      setStatus("idle");
      setErrorField(null);
    }
  };

  const reject = (field: Field) => {
    setStatus("error");
    setErrorField(field);
    refs[field].current?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const message = values.message.trim();
    const phone = normalizePhone(values.phone);
    const digits = phone.replace(/\D/g, "").length;

    if (!firstName) return reject("firstName");
    if (!lastName) return reject("lastName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reject("email");
    if (digits < 10 || digits > 15) return reject("phone");
    if (!message) return reject("message");

    setStatus("submitting");
    setErrorField(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          message,
          source: "contact_form",
          path: window.location.pathname,
          utm: getAttribution(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("lead_submit", { source: "contact_form" });
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorField("send");
    }
  };

  const described = status === "error" ? "contact-error" : undefined;

  return (
    <section
      id="contact"
      aria-labelledby="contact-headline"
      className="light-pool relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
    >
      <div className="relative mx-auto max-w-page">
        <FadeUp>
          <SectionHeading
            id="contact-headline"
            eyebrow={contact.eyebrow}
            headline={contact.headline}
            sub={contact.body}
          />
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="surface mx-auto mt-10 max-w-xl rounded-[3px] p-6 sm:mt-14 sm:p-8">
            {status === "sent" ? (
              <div role="status" className="flex flex-col items-center gap-4 py-8 text-center">
                {/* A mark above the line, not a bullet beside it: the message
                    wraps, and a dot pinned to the left of a wrapping block
                    drifts away from the text it belongs to. */}
                <svg
                  aria-hidden="true"
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gold"
                >
                  <circle cx="15" cy="15" r="12" />
                  <path d="m9.5 15.4 3.7 3.6 7.3-7.8" />
                </svg>
                <p className="max-w-[30ch] text-[16px] leading-relaxed text-bone">{contact.success}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {/* Two short fields on one row read as a single step. */}
                <div className="flex gap-3">
                  {(["firstName", "lastName"] as const).map((field) => (
                    <div key={field} className="min-w-0 flex-1">
                      <label htmlFor={`contact-${field}`} className="sr-only">
                        {contact.fields[field].label}
                      </label>
                      <input
                        ref={refs[field] as React.RefObject<HTMLInputElement>}
                        id={`contact-${field}`}
                        name={field}
                        type="text"
                        autoComplete={field === "firstName" ? "given-name" : "family-name"}
                        placeholder={contact.fields[field].placeholder}
                        required
                        value={values[field]}
                        onChange={set(field)}
                        aria-invalid={errorField === field}
                        aria-describedby={described}
                        className="field h-12"
                      />
                    </div>
                  ))}
                </div>

                <label htmlFor="contact-email" className="sr-only">
                  {contact.fields.email.label}
                </label>
                <input
                  ref={refs.email as React.RefObject<HTMLInputElement>}
                  id="contact-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={contact.fields.email.placeholder}
                  required
                  value={values.email}
                  onChange={set("email")}
                  aria-invalid={errorField === "email"}
                  aria-describedby={described}
                  className="field mt-3 h-12"
                />

                <label htmlFor="contact-phone" className="sr-only">
                  {contact.fields.phone.label}
                </label>
                <input
                  ref={refs.phone as React.RefObject<HTMLInputElement>}
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={contact.fields.phone.placeholder}
                  required
                  value={values.phone}
                  onChange={set("phone")}
                  aria-invalid={errorField === "phone"}
                  aria-describedby={described}
                  className="field mt-3 h-12"
                />

                <label htmlFor="contact-message" className="sr-only">
                  {contact.fields.message.label}
                </label>
                <textarea
                  ref={refs.message as React.RefObject<HTMLTextAreaElement>}
                  id="contact-message"
                  name="message"
                  rows={4}
                  placeholder={contact.fields.message.placeholder}
                  required
                  value={values.message}
                  onChange={set("message")}
                  aria-invalid={errorField === "message"}
                  aria-describedby={described}
                  className="field mt-3 min-h-[132px] resize-y py-3 leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="cta-glow mt-4 inline-flex h-12 w-full select-none items-center justify-center whitespace-nowrap rounded-[3px] bg-gold px-6 font-sans text-[16px] font-bold tracking-[0.01em] text-ink transition-[background-color,opacity] duration-200 ease-expensive hover:bg-gold-deep disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-gold"
                >
                  {status === "submitting" ? contact.sending : contact.button}
                </button>

                {status === "error" && errorField && (
                  <p id="contact-error" role="alert" className="mt-3 text-center text-[13px] text-bone">
                    {contact.errors[errorField]}
                  </p>
                )}

                <p className="mt-4 text-center text-[11px] leading-snug text-mute/80">{contact.consent}</p>
              </form>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
