/**
 * Captures each section of the landing page at a 390px mobile viewport
 * (plus a full-page capture and a desktop capture) into ./screenshots/.
 *
 * Usage: npm run build && npm run start   (in another terminal)
 *        node scripts/screenshots.mjs [http://localhost:3000]
 */
import { createRequire } from "node:module";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = join(process.cwd(), "screenshots");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const SECTIONS = [
  "hero",
  "proof",
  "scores",
  "problem",
  "how-it-works",
  "included",
  "testimonials",
  "faq",
  "guarantee",
  "final-cta",
];

const browser = await chromium.launch();

// --- Mobile: 390 x 844 (iPhone 14 class), DPR 2 ---------------------------
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await mobile.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

await page.screenshot({ path: join(OUT, "mobile-00-hero-viewport.png") });

for (const id of SECTIONS) {
  const el = page.locator(`#${id}`);
  if ((await el.count()) === 0) {
    console.warn(`missing #${id}`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(OUT, `mobile-${id}-viewport.png`) });
  await el.screenshot({ path: join(OUT, `mobile-${id}-full.png`) });
}

// Footer + sticky bar visible mid-page.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await page.screenshot({ path: join(OUT, "mobile-footer-viewport.png") });

await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
await page.waitForTimeout(1000);
await page.screenshot({ path: join(OUT, "mobile-sticky-bar.png") });

// Lightbox open.
const firstCard = page.locator("#proof button").first();
if ((await firstCard.count()) > 0) {
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "mobile-lightbox.png") });
  await page.keyboard.press("Escape");
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, "mobile-full-page.png"), fullPage: true });

// Thank-you page.
await page.goto(`${BASE}/thank-you`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, "mobile-thank-you.png"), fullPage: true });

await mobile.close();

// --- Desktop: 1440 x 900 ---------------------------------------------------
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const d = await desktop.newPage();
await d.goto(BASE, { waitUntil: "networkidle" });
await d.waitForTimeout(2500);
await d.screenshot({ path: join(OUT, "desktop-hero.png") });
await d.evaluate(() => window.scrollTo(0, 0));
await d.screenshot({ path: join(OUT, "desktop-full-page.png"), fullPage: true });
await desktop.close();

await browser.close();
console.log("Screenshots written to", OUT);
