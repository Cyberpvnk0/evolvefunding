/**
 * Generates labeled placeholder media in /public/proof/.
 * Run: node scripts/placeholders.mjs
 *
 * Each image is a dark, vignetted frame with the filename printed on it so it
 * is obvious on the live page which asset still needs replacing. Delete this
 * script once real assets are in place, or keep it for future placeholders.
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

const OUT = join(process.cwd(), "public", "proof");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/** @type {Array<{file:string,w:number,h:number,label:string,hint:string,kind?:"photo"|"score"|"avatar"|"poster"}>} */
const assets = [];

assets.push({ file: "hero-poster.jpg", w: 1920, h: 1080, label: "HERO POSTER", hint: "Fallback frame for hero-loop.mp4", kind: "poster" });
assets.push({ file: "final-cta.jpg", w: 1920, h: 1080, label: "FINAL CTA PHOTO", hint: "Still photo, client with keys at dusk", kind: "poster" });
assets.push({ file: "og-image.jpg", w: 1200, h: 630, label: "OPEN GRAPH IMAGE", hint: "Shown when the link is shared", kind: "poster" });

const cars = ["corvette", "bmw", "mercedes", "tesla", "f150", "range-rover", "charger", "audi", "lexus", "tahoe", "mustang", "house"];
cars.forEach((car, i) => {
  const n = i + 1;
  assets.push({ file: `client-${car}-${n}.jpg`, w: 1200, h: 1500, label: `CLIENT PHOTO ${n}`, hint: `Client with their ${car.replace("-", " ")}`, kind: "photo" });
  assets.push({ file: `score-before-after-${n}.png`, w: 900, h: 1600, label: `SCORE SCREENSHOT ${n}`, hint: "Before and after, from the bureau app", kind: "score" });
});

for (let n = 1; n <= 6; n++) {
  assets.push({ file: `score-before-${n}.png`, w: 800, h: 1000, label: `BEFORE ${n}`, hint: "Score screenshot with date", kind: "score" });
  assets.push({ file: `score-after-${n}.png`, w: 800, h: 1000, label: `AFTER ${n}`, hint: "Score screenshot with date", kind: "score" });
}

for (let n = 1; n <= 5; n++) {
  assets.push({ file: `testimonial-${n}.jpg`, w: 320, h: 320, label: `T${n}`, hint: "", kind: "avatar" });
}

function html({ w, h, label, hint, kind, file }) {
  const bg = kind === "score" ? "#101010" : "#141414";
  const big = kind === "avatar" ? Math.round(w * 0.28) : Math.round(Math.min(w, h) * 0.055);
  const small = Math.round(Math.min(w, h) * 0.024);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg};font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#F2EEE6}
    .frame{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center}
    .frame::before{content:"";position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 45%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%),linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 50%)}
    .box{position:absolute;inset:${Math.round(Math.min(w,h)*0.05)}px;border:1px solid rgba(201,169,97,0.35)}
    .label{position:relative;font-weight:600;letter-spacing:.14em;font-size:${big}px;color:#C9A961}
    .hint{position:relative;margin-top:${Math.round(big*0.6)}px;font-size:${small}px;color:#A6A199;letter-spacing:.02em}
    .file{position:absolute;left:0;right:0;bottom:${Math.round(Math.min(w,h)*0.08)}px;font-size:${small}px;color:rgba(242,238,230,.45);letter-spacing:.06em}
    .phone{position:absolute;left:12%;right:12%;top:10%;bottom:10%;border:1px solid rgba(242,238,230,.12);border-radius:${Math.round(w*0.04)}px}
    .phone .bar{position:absolute;left:0;right:0;top:0;height:${Math.round(h*0.05)}px;border-bottom:1px solid rgba(242,238,230,.08)}
    .phone .num{position:absolute;left:0;right:0;top:32%;text-align:center;font-size:${Math.round(w*0.16)}px;color:rgba(242,238,230,.10);font-weight:700;letter-spacing:-.03em}
  </style></head><body><div class="frame">
    ${kind === "score" ? '<div class="phone"><div class="bar"></div><div class="num">000</div></div>' : '<div class="box"></div>'}
    <div><div class="label">${label}</div>${hint ? `<div class="hint">${hint}</div>` : ""}</div>
    ${kind === "avatar" ? "" : `<div class="file">/proof/${file}</div>`}
  </div></body></html>`;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const a of assets) {
  await page.setViewportSize({ width: a.w, height: a.h });
  await page.setContent(html(a));
  const isJpg = a.file.endsWith(".jpg");
  await page.screenshot({
    path: join(OUT, a.file),
    type: isJpg ? "jpeg" : "png",
    ...(isJpg ? { quality: 72 } : {}),
    fullPage: false,
  });
  process.stdout.write(`${a.file} `);
}
await browser.close();
console.log("\nDone:", assets.length, "assets");
