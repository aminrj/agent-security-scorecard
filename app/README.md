# Agent Security Scorecard

20-question self-assessment scored against the OWASP Top 10 for Agentic Applications 2026 (ASI01–ASI10). Client-side SPA — no backend required. One serverless function for Beehiiv newsletter capture.

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Deploy — Cloudflare Pages (recommended)

1. **Connect repo** to Cloudflare Pages (Settings → Build: `npm run build`, output: `dist`).
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
