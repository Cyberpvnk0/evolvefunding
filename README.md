# Evolve Funding — Sales Funnel

A single-page, mobile-first sales funnel for the Evolve Funding credit repair subscription ($147/month). One goal: get the visitor to click through to checkout. No call booking, no nav menu, no distractions.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion. Deploys to Vercel in about five minutes.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit .env.local
npm run dev                    # http://localhost:3000
```

Production check:

```bash
npm run build && npm run start
```

---

## 1. Set the environment variables

All configuration lives in environment variables. Copy `.env.example` to `.env.local` for local work, and add the same keys in Vercel for production.

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for Open Graph tags, the sitemap, and robots.txt. A bare domain works; a trailing slash is stripped. Blank or invalid falls back to `https://evolvefundingllc.com`. |
| `NEXT_PUBLIC_CHECKOUT_URL` | No | Where every CTA sends the visitor. Provider-neutral: an order form, a hosted checkout, another landing page. Leave it unset and the buttons render but stay inert. |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Meta Pixel ID. Leave blank to ship no Meta code. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | No | TikTok Pixel ID. Leave blank to ship no TikTok code. |
| `NEXT_PUBLIC_GA4_ID` | No | GA4 measurement ID (`G-XXXXXXX`). Leave blank to ship no GA code. The site sends `page_view` itself on every route change, so turn off **Enhanced measurement → Page changes based on browser history events** in the GA4 data stream, otherwise client-side navigations are double-counted. |
| `GHL_WEBHOOK_URL` | No | GoHighLevel inbound webhook. The exit-intent phone form POSTs here, server-side. If blank, the form still succeeds in the UI but nothing is forwarded. |

Every variable is optional and every one is blank-safe: a variable that exists but is empty is treated as unset, so the build never fails on a missing or blank value.

`NEXT_PUBLIC_*` values are inlined into the bundle at build time. Changing one in Vercel does not affect an existing deployment — you have to redeploy.

### No payment processor is wired up

There is no Stripe, and no processor SDK anywhere in the repo. The CTAs point at whatever URL you put in `NEXT_PUBLIC_CHECKOUT_URL`. When you pick a processor or order form, paste its URL there and redeploy — nothing else changes.

Two things to update when you do:

- `finalCta.badges[0]` in `content/site.ts` currently reads "Secure checkout". Name the processor once you have one.
- `privacy.sections` mentions "our payment provider" generically.

### Which CTA converted?

Each button appends `ref=<section>` to the destination (`hero`, `sticky_bar`, `proof`, `included`, `faq`, `final`), alongside the visitor's UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) and `fbclid`, `ttclid`, `gclid`. Those are captured on first load, held in sessionStorage, and forwarded on every CTA. Whether the destination stores them depends on what you point it at; the `cta_click` and `checkout_redirect` pixel events give you click-level attribution regardless.

### Events fired

The wrapper in `lib/analytics.ts` fans one `track()` call out to whichever pixels are configured.

| Event | When | Meta | TikTok | GA4 |
| --- | --- | --- | --- | --- |
| `page_view` | On every route change | PageView | page | page_view |
| `scroll_50` | 50% scroll depth | custom | custom | event |
| `scroll_90` | 90% scroll depth | custom | custom | event |
| `cta_click` | Any checkout button, with `section` | custom | custom | event |
| `checkout_redirect` | Same click, right before leaving | InitiateCheckout | InitiateCheckout | event |
| `lead_submit` | Exit-intent form success | Lead | SubmitForm | event |
| `vsl_play` | Visitor presses play on the hero video | ViewContent | ViewContent | event |
| `vsl_progress` | 25%, 50%, 75% watched (with `percent`) | custom | custom | event |
| `vsl_complete` | Video watched to the end | custom | custom | event |

`vsl_progress` is the most useful number on this page: it tells you where in the video people leave, which is what you rewrite next.

In development every event is also printed to the browser console as `[analytics] <event>`.

---

## 2. Add client photos, scores, and copy

**Everything editable lives in one file: `content/site.ts`.** Components never contain copy or asset paths. Placeholders are written in `SCREAMING_SNAKE_CASE` (`CLIENT_NAME_1`, `CITY_1`, `DATE_BEFORE_1`) so they are impossible to miss on the live page.

### Client photo cards (the proof wall)

1. Drop the photo into `public/proof/`. Portrait 4:5 works best (1200 × 1500 px). Keep each JPEG under 300 KB; `next/image` handles resizing and AVIF/WebP conversion.
2. Drop the credit score screenshot (shown in the lightbox when the card is tapped) into `public/proof/` as well.
3. Edit the matching entry in `proofClients`:

```ts
{
  id: "client-1",
  name: "Marcus T.",                              // first name + last initial
  photo: "/proof/client-corvette-1.jpg",          // the photo with the car
  photoAlt: "Marcus standing beside a red Corvette",
  scoreShot: "/proof/score-before-after-1.png",   // opens in the lightbox
  before: 552,
  after: 718,
  approved: "2023 Corvette",
},
```

Add or remove entries freely. Twelve is a good minimum; the gallery scrolls horizontally on phones and lays out as a three-column masonry on desktop.

### Score screenshot strip

Edit `scoreShots`. Each item has a `before` and `after` object with an `image`, `score`, and `date`:

```ts
{
  id: "score-1",
  label: "Marcus T.",
  before: { image: "/proof/score-before-1.png", score: 552, date: "Jan 2024" },
  after:  { image: "/proof/score-after-1.png",  score: 718, date: "May 2024" },
},
```

### The hero video (VSL)

The hero is built around your video sales letter. Everything lives under `hero.vsl` in `content/site.ts`.

**Self-hosted (default).** Drop your file at `public/proof/vsl.mp4` and a thumbnail at `public/proof/vsl-poster.jpg`. Nothing else to do.

```ts
vsl: {
  type: "file",
  src: "/proof/vsl.mp4",
  poster: "/proof/vsl-poster.jpg",
  aspect: "16 / 9",          // "9 / 16" if you cut it vertical
  hint: "4 minutes, sound on.",
  captions: "",              // optional "/proof/vsl.vtt"
}
```

**Hosted elsewhere.** Set `type: "embed"` and paste the platform's *embed* URL (not the share URL) into `embedUrl`. The iframe is only created when someone presses play, so the platform's scripts never load for a visitor who does not watch.

```ts
vsl: { type: "embed", embedUrl: "https://player.vimeo.com/video/123456789", ... }
```

Notes worth knowing:

- **Nothing downloads until play.** A self-hosted file carries `preload="none"`; an embed does not exist until clicked. That is what lets a video sit above the fold and still score 90+ on mobile.
- **It starts with sound**, because a VSL is spoken. That only works because `play()` runs inside the click itself, so do not move it into an effect.
- **The poster is the highest-leverage asset on the page.** It is the first thing a visitor judges and it decides your play rate. Your face, large, plus one legible result. 1600 × 900.
- Re-encode for the web with `-movflags +faststart` so playback begins before the file finishes downloading.
- Set `hint` to the real running time (it ships as `VSL_LENGTH_PLACEHOLDER`). Stating the length raises completion rates. Empty string hides the line.

### Hero video and stills

| Asset | Path | Notes |
| --- | --- | --- |
| VSL | `public/proof/vsl.mp4` | Your video sales letter, the centrepiece of the hero. 1280 × 720 or 1920 × 1080, H.264, `-movflags +faststart` so it starts instantly: `ffmpeg -i in.mov -vf scale=1280:-2 -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart vsl.mp4`. Nothing downloads until the visitor presses play. |
| VSL poster | `public/proof/vsl-poster.jpg` | The thumbnail before play, and the LCP image. This single asset moves play rate more than anything else on the page: your face, large, plus a legible result. 1600 × 900, under 150 KB. |
| Hero backdrop | `public/proof/hero-backdrop.jpg` | Dark still behind the video, held at 40% opacity. 1920 × 1080, under 150 KB. |
| Final CTA still | `public/proof/final-cta.jpg` | 1920 × 1080. |
| Open Graph | `public/proof/og-image.jpg` | 1200 × 630. Shown when the link is shared. |
| Testimonial avatars | `public/proof/testimonial-N.jpg` | Square, 320 × 320. |

The video is skipped automatically for visitors who prefer reduced motion or have Data Saver on; they see the poster.

### Headline numbers you must confirm

- `hero.counter` — the counter animates from `from` to `to` on load. The `label` ("Average client jump in 90 days") is a placeholder. Confirm the real figure.
- `hero.trust` — "500+ items removed", "4.9 rating", "Secure checkout".
- `finalCta.clientCount.value` — used in "Join 1,200+ clients".
- `testimonials` — the quotes are sample copy. Replace with verbatim client words.
- `footer.disclaimer` and `disclosures` — contain a `CROA_DISCLOSURE_PLACEHOLDER`. Have counsel supply the required Credit Repair Organizations Act text before launch.
- `brand.smsNumber`, `brand.email`, `brand.address`.

### Regenerating placeholders

`node scripts/placeholders.mjs` rewrites every placeholder image in `public/proof/` (requires Playwright). Delete the script once real assets are in.

---

## 3. Deploy to Vercel in 5 minutes

1. Push this repo to GitHub.
2. In Vercel, **Add New Project**, import the repo. Framework preset is detected as Next.js. Leave build settings at their defaults.
3. Under **Environment Variables**, add the keys from the table above, or use **Import .env** with the file you were given. Every key is optional, so you can deploy first and add them later — just redeploy afterwards.
4. Click **Deploy**. First build takes about a minute.
5. Add your domain under **Settings → Domains** and set `NEXT_PUBLIC_SITE_URL` to match, then redeploy.

Every push to `main` redeploys. Preview deployments get their own URL, so you can point a preview at a test destination by setting a different `NEXT_PUBLIC_CHECKOUT_URL` for the Preview environment.

### After paying

Whatever you eventually use for checkout, point its post-payment redirect at `https://yourdomain.com/thank-you`. That page is `noindex` and has the next steps and a "Text us now" button.

---

## Page structure

| # | Section | File |
| --- | --- | --- |
| 1 | Hero: headline, VSL, buy button, score counter, trust row | `components/sections/Hero.tsx`, `VslPlayer.tsx` |
| 2 | Sticky CTA bar (bottom on mobile, top on desktop) | `components/sections/StickyBar.tsx` |
| 3 | Proof wall: client photos with lightbox, score screenshot strip | `components/sections/ProofWall.tsx`, `ScoreStrip.tsx` |
| 4 | The problem, three lines | `components/sections/Problem.tsx` |
| 5 | How it works, three steps | `components/sections/HowItWorks.tsx` |
| 6 | What's included, one card with value anchor | `components/sections/Included.tsx` |
| 7 | Testimonials carousel | `components/sections/Testimonials.tsx` |
| 8 | FAQ accordion | `components/sections/Faq.tsx` |
| 9 | Risk reversal + final CTA | `components/sections/FinalCta.tsx` |
| 10 | Footer with disclaimer | `components/sections/Footer.tsx` |
| — | Exit-intent / 45-second slide-up (first name, last name, phone) | `components/ExitIntent.tsx`, `app/api/lead/route.ts` |
| — | Thank-you, Disclosures, Privacy, Terms | `app/thank-you`, `app/disclosures`, `app/privacy`, `app/terms` |

---

## Performance notes

- Only the two hero images (`priority`) load eagerly. Everything else lazy loads through `next/image`.
- The VSL downloads nothing until it is played, so an unwatched video costs the page zero bytes.
- Pixel scripts are inlined only when their env var is set. An empty `.env` ships zero third-party bytes.
- `prefers-reduced-motion` disables the count-up, fade-ups, video, and accordion animation.

Audit locally:

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --preset=perf --form-factor=mobile --screenEmulation.mobile --view
```

Screenshots of every section at 390 px:

```bash
node scripts/screenshots.mjs   # writes ./screenshots/
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (fails on type or lint errors) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
