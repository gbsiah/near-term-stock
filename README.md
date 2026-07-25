# Near Term Signal

A focused web interface that generates a ranked list of ten liquid U.S.-listed
stocks trading below $120. The screen adapts the
`analyze-equity-price-potential` skill to the data available in an automated
price-and-volume pass.

Live site: [gbsiah.github.io/near-term-stock](https://gbsiah.github.io/near-term-stock/)

## What the button does

- Fetches six months of daily market data for a curated universe of liquid U.S.
  equities.
- Applies the requested $120 current-price ceiling and a 500,000-share
  20-day average-volume floor.
- Scores price momentum, sector support, technical trend, volume/positioning,
  expectation room, downside risk, and liquidity.
- Returns ten names with current/reference price, entry/reference zone,
  bear/base/bull targets, probability-weighted target, confidence, risk, and
  invalidation signals.

The screen is a quantitative first pass. It explicitly identifies that analyst
revisions, fundamental valuation, options positioning, and verified catalyst
calendars are not included in the automated result.

## Local development

Use Node.js 22 or newer:

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

## Deployment

GitHub Pages serves the browser interface from `docs/`. A weekday GitHub Action
builds the Cloudflare Worker-compatible vinext application, runs its skill-based
screen, and refreshes `docs/data/latest.json`. The public page therefore needs
no client-side API key and exposes no credentials.

## Research notice

Outputs are structured research, not personal financial advice. Forecasts are
uncertain scenarios, not guaranteed returns or instructions to buy or sell.
