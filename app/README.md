# Agent Security Scorecard

> *Are your AI agents locked down? Find out in 12 minutes.*

A 20-question quiz that tells you how secure your AI agents actually are — scored against the OWASP Top 10 for Agentic Applications 2026, the current authoritative standard for agentic AI risk.

## Why it exists

AI agents hold credentials, send emails, write to databases, and chain tool calls on your behalf. Most teams deploying them have no inventory of what agents exist, no scoped permissions, and no way to stop one if it goes rogue. They don't know they're exposed until something breaks.

This tells you *which* of those gaps you have and *what to fix first* — instead of handing you a 40-page framework PDF and leaving you to figure it out.

## What you get

- A **score (0–100)** across four maturity bands: Exposed → Reactive → Managed → Resilient
- A **named archetype** ("Optimistic Adopter", "Blind Operator", etc.) that describes your security *shape*, not just a number
- A **radar chart** across 5 risk domains (Governance, Identity, Cognition, Supply Chain, Detection)
- Your **top 3 gaps**, each with a concrete action to take this week and a way to verify you fixed it
- A **PDF report** with the full breakdown — email required for that part, everything else is instant and ungated

## Who it's for

Security engineers, AppSec leads, and CISOs deploying or evaluating AI agents who need to know where they stand — in an afternoon, for free, without a vendor sales call.

## How to use it

Free, no account, runs entirely in the browser. Go to the URL, answer 20 questions, see your result immediately. Email is only needed if you want the PDF remediation report.

---

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Deploy — Cloudflare Pages (recommended)

1. **Connect repo** to Cloudflare Pages (Settings → Build: `npm run build`, output: `dist`, root: `app`).
2. **Set secrets** in Pages → Settings → Environment variables:
   - `BEEHIIV_API_KEY` (secret) — from Beehiiv dashboard → Settings → API
   - `BEEHIIV_PUBLICATION_ID` (plain text) — e.g. `pub_xxxxxxxx-...`
3. **Set domain** — add a custom domain (e.g. `agentsecurity.yourdomain.com`).
4. **Update index.html** — replace `YOURDOMAIN` in the Plausible script tag with your actual domain.
5. **Add domain to Plausible** — create the site in your Plausible dashboard.

The `functions/api/subscribe.ts` file is automatically deployed as a Cloudflare Pages Function. No extra wrangler config needed.

### Local Pages dev (with the Function)

```bash
npx wrangler pages dev dist --compatibility-date=2024-01-01
```

## Deploy — Netlify / Vercel

The `public/_redirects` file handles SPA routing on Netlify. For Vercel, add a `vercel.json`:
```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }
```

For the Beehiiv proxy on Vercel, create `api/subscribe.ts` using Vercel Edge runtime — same logic as `functions/api/subscribe.ts`, different export signature.

## Architecture

- **All scoring is client-side** — answers never leave the browser.
- **URL sharing** — results encoded as base64 in `#r=` hash. Shared links reproduce the full result without any server.
- **PDF** — generated client-side with jsPDF (lazy-loaded on demand).
- **Analytics** — Plausible custom events at: Assessment Started → Assessment Completed → Results Viewed → Email Submitted → Share Clicked.
- **UTMs** — captured from URL on first load, stored in sessionStorage, forwarded to Beehiiv on submission.

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `BEEHIIV_API_KEY` | CF Pages secret | Beehiiv API authentication |
| `BEEHIIV_PUBLICATION_ID` | CF Pages plain text | e.g. `pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

Neither variable is needed to build or run the app locally. If absent, email capture silently no-ops and the PDF still generates.

## Content

- **Questions + domains:** `src/data/questions.ts`
- **Scoring, bands, archetypes:** `src/data/scoring.ts`
- **PDF generation:** `src/utils/pdfGenerator.ts`
- **Beehiiv proxy:** `functions/api/subscribe.ts`
