#!/usr/bin/env bash
# Runs a mobile Lighthouse audit against a running production server.
# Usage: npm run build && npm run start &   then   bash scripts/lighthouse.sh [url]
set -euo pipefail
URL="${1:-http://localhost:3000}"
OUT="${2:-./lighthouse-report}"
CHROME="${CHROME_PATH:-}"
if [ -z "$CHROME" ] && [ -x /opt/pw-browsers/chromium-1194/chrome-linux/chrome ]; then
  CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
fi
export CHROME_PATH="$CHROME"
lighthouse "$URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile \
  --screenEmulation.mobile \
  --throttling-method=simulate \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --output=json --output=html \
  --output-path="$OUT" \
  --quiet
node -e '
const r = require(process.argv[1] + ".report.json");
const c = r.categories;
console.log("Performance:", Math.round(c.performance.score*100));
console.log("Accessibility:", Math.round(c.accessibility.score*100));
console.log("Best practices:", Math.round(c["best-practices"].score*100));
console.log("SEO:", Math.round(c.seo.score*100));
const a = r.audits;
for (const k of ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"]) console.log(k, a[k].displayValue);
' "$OUT"
