import { NextResponse } from "next/server";

/**
 * POST /api/lead. Receives the exit-intent phone number and forwards it to the
 * GoHighLevel inbound webhook, server-side, so the webhook URL never reaches
 * the browser.
 *
 * With GHL_WEBHOOK_URL unset (local, preview) the route still answers
 * { ok: true, forwarded: false } so the form succeeds, and warns once in the
 * server log. Only POST is exported, so every other method gets a 405 from
 * Next. The webhook URL is never logged or echoed.
 */
export const runtime = "nodejs";

/** How long we wait on the webhook before giving up. */
const TIMEOUT_MS = 8000;
const SOURCES = new Set(["exit_intent", "timer"]);
/** Same attribution keys lib/checkout.ts captures. Anything else is dropped. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "ttclid",
  "gclid",
] as const;

let warnedMissingWebhook = false;

interface LeadBody {
  phone?: unknown;
  source?: unknown;
  path?: unknown;
  utm?: unknown;
}

/** Keep only known attribution keys with non-empty string values. */
function pickUtm(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== "object") return out;
  const obj = input as Record<string, unknown>;
  for (const key of UTM_KEYS) {
    const value = obj[key];
    if (typeof value === "string" && value) out[key] = value.slice(0, 200);
  }
  return out;
}

export async function POST(req: Request) {
  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const raw = typeof body.phone === "string" ? body.phone.trim() : "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Digits only, keeping a leading "+" so international numbers survive.
  const phone = (raw.startsWith("+") ? "+" : "") + digits;

  const source = typeof body.source === "string" && SOURCES.has(body.source) ? body.source : "unknown";
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : "/";
  const utm = pickUtm(body.utm);

  const webhook = process.env.GHL_WEBHOOK_URL;
  if (!webhook) {
    if (!warnedMissingWebhook) {
      warnedMissingWebhook = true;
      // eslint-disable-next-line no-console
      console.warn("[lead] GHL_WEBHOOK_URL is not set. Leads are accepted but not forwarded.");
    }
    return NextResponse.json({ ok: true, forwarded: false });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        source,
        path,
        ...utm,
        submittedAt: new Date().toISOString(),
        site: "evolvefunding",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.ok) return NextResponse.json({ ok: true, forwarded: true });

    // eslint-disable-next-line no-console
    console.error(`[lead] webhook responded ${res.status}`);
    return NextResponse.json({ ok: false }, { status: 502 });
  } catch (err) {
    // Only the error name: a full message could include the webhook host.
    // eslint-disable-next-line no-console
    console.error(`[lead] webhook request failed (${err instanceof Error ? err.name : "unknown"})`);
    return NextResponse.json({ ok: false }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
