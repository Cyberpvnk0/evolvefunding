# Evolve Funding — Sales Funnel

A single-page, mobile-first sales funnel for the Evolve Funding credit repair subscription ($147/month). One goal: get the visitor to the Stripe checkout. No call booking, no nav menu, no distractions.

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

## 1. Set the checkout URL and pixel IDs

All configuration lives in environment variables. Copy `.env.example` to `.env.local` for local work, and add the same keys in Vercel for production.

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_CHECKOUT_URL` | Yes | Your Stripe Payment Link. Every CTA on the site points here. UTM params and a `ref=<section>` param are appended automatically. |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Meta Pixel ID. Leave blank to ship no Meta code. |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | No | TikTok Pixel ID. Leave blank to ship no TikTok code. |
| `NEXT_PUBLIC_GA4_ID` | No | GA4 measurement ID (`G-XXXXXXX`). Leave blank to ship no GA code. |
| `GHL_WEBHOOK_URL` | No | GoHighLevel inbound webhook. The exit-intent phone form POSTs here, server-side. If blank, the form still succeeds in the UI but nothing is forwarded. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for Open Graph tags, sitemap, and robots. Defaults to `https://evolvefunding.com`. |

The checkout URL is never hardcoded. Search the codebase for `NEXT_PUBLIC_CHECKOUT_URL` and you will find exactly one read, in `lib/env.ts`.

### Which CTA converted?

Each button appends `ref=<section>` to the checkout link (`hero`, `sticky_bar`, `proof`, `included`, `faq`, `final`). Stripe stores the full URL parameters on the Checkout Session, so you can attribute payments to the section that sent them. UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) plus `fbclid`, `ttclid`, and `gclid` are captured on first load, held in sessionStorage, and forwarded on every CTA.

### Events fired

The wrapper in `lib/analytics.ts` fans one `track()` call out to whichever pixels are configured.

| Event | When | Meta | TikTok | GA4 |
| --- | --- | --- | --- | --- |
| `page_view` | On load | PageView | page | page_view |
| `scroll_50` | 50% scroll depth | custom | custom | event |
| `scroll_90` | 90% scroll depth | custom | custom | event |
| `cta_click` | Any checkout button, with `section` | custom | custom | event |
| `checkout_redirect` | Same click, right before leaving | InitiateCheckout | InitiateCheckout | event |
| `lead_submit` | Exit-intent phone form success | Lead | SubmitForm | event |

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

### Hero video and stills

| Asset | Path | Notes |
| --- | --- | --- |
| Hero loop | `public/proof/hero-loop.mp4` | Muted, looping. Aim for under 2 MB and under 15 seconds, 1280 × 720, H.264. `ffmpeg -i in.mp4 -vf scale=1280:-2 -an -c:v libx264 -crf 30 -movflags +faststart hero-loop.mp4` |
| Hero poster | `public/proof/hero-poster.jpg` | First frame of the loop. This is the LCP image and is preloaded. 1920 × 1080, under 150 KB. |
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
3. Under **Environment Variables**, add `NEXT_PUBLIC_CHECKOUT_URL` and any pixel IDs from the table above. Add `GHL_WEBHOOK_URL` if you want the exit-intent form forwarded.
4. Click **Deploy**. First build takes about a minute.
5. Add your domain under **Settings → Domains** and set `NEXT_PUBLIC_SITE_URL` to match, then redeploy.

Every push to `main` redeploys. Preview deployments get their own URL, so you can point a preview at a Stripe test-mode Payment Link by setting a different `NEXT_PUBLIC_CHECKOUT_URL` for the Preview environment.

### After paying

Set the Stripe Payment Link's **After payment** option to redirect to `https://yourdomain.com/thank-you`. That page is `noindex` and has the next steps and a "Text us now" button.

---

## Page structure

| # | Section | File |
| --- | --- | --- |
| 1 | Hero: video, headline, live score counter, CTA, trust row | `components/sections/Hero.tsx` |
| 2 | Sticky CTA bar (bottom on mobile, top on desktop) | `components/sections/StickyBar.tsx` |
| 3 | Proof wall: client photos with lightbox, score screenshot strip | `components/sections/ProofWall.tsx`, `ScoreStrip.tsx` |
| 4 | The problem, three lines | `components/sections/Problem.tsx` |
| 5 | How it works, three steps | `components/sections/HowItWorks.tsx` |
| 6 | What's included, one card with value anchor | `components/sections/Included.tsx` |
| 7 | Testimonials carousel | `components/sections/Testimonials.tsx` |
| 8 | FAQ accordion | `components/sections/Faq.tsx` |
| 9 | Risk reversal + final CTA | `components/sections/FinalCta.tsx` |
| 10 | Footer with disclaimer | `components/sections/Footer.tsx` |
| — | Exit-intent / 45-second slide-up | `components/ExitIntent.tsx`, `app/api/lead/route.ts` |
| — | Thank-you, Disclosures, Privacy, Terms | `app/thank-you`, `app/disclosures`, `app/privacy`, `app/terms` |

---

## Performance notes

- The hero poster is the only `priority` image. Everything else lazy loads through `next/image`.
- The hero video mounts after hydration so it never competes with the poster for bandwidth.
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
