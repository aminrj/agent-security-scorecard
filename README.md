# Agent Security Scorecard

**Score your AI agents against the [OWASP Top 10 for Agentic Applications 2026](https://owasp.org/www-project-top-10-for-large-language-model-applications/) in 12 minutes.**

[![Live Demo](https://img.shields.io/badge/try-the_live_tool-6366f1?style=flat-square)](https://scorecard.aminrj.com/)
[![OWASP Agentic Top 10](https://img.shields.io/badge/ASI-ASI01--ASI10-8b5cf6?style=flat-square)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## What is this?

A free, self-serve diagnostic that scores your organization's agentic AI security posture across **5 domains** and **20 questions** — grounded in the OWASP Agentic Top 10 (ASI01–ASI10, December 2026).

You get:
- **A global maturity score** (Exposed → Resilient)
- **A radar chart** showing your posture across all 5 domains
- **Your top 3 risks**, ranked by severity × gap, each with a concrete first action
- **A 30-day remediation roadmap** — sequenced, not just listed
- **A downloadable PDF report** with full remediation guidance

No login required. No data stored. All scoring runs in your browser.

---

## The 5 Domains

| Domain | ASI Controls | What it covers |
|--------|-------------|----------------|
| **A — Agent Inventory & Governance** | ASI10 | Do you know your agents exist, who owns them, and is there a gate before they ship? |
| **B — Identity, Access & Least Agency** | ASI02, ASI03 | Per-agent identities, scoped permissions, JIT credentials, user authorization propagation. |
| **C — Input Trust & Cognition Integrity** | ASI01, ASI06 | Prompt injection defenses, intent re-validation, memory provenance, adversarial testing. |
| **D — Execution & Supply Chain Safety** | ASI04, ASI05, ASI07 | Sandboxing, MCP/tool vetting, inter-agent auth, capability allow-lists. |
| **E — Detection, Response & Containment** | ASI08, ASI09, ASI10 | Action-level audit trails, behavioral monitoring, kill-switches, human trust exploitation. |

---

## Maturity Bands

| Band | Score | Meaning |
|------|-------|---------|
| 🔴 **Exposed** | 0–25 | Little to no agent-specific security. Operating on hope. |
| 🟠 **Reactive** | 26–50 | Some ad hoc controls. You'd detect a loud failure but not a quiet compromise. |
| 🟡 **Managed** | 51–75 | Defined, documented controls. You can answer "where are we weak" with evidence. |
| 🟢 **Resilient** | 76–100 | Enforced least agency, full auditability, tested containment. |

---

## Try it

Go to **[scorecard.aminrj.com](https://scorecard.aminrj.com/)** — takes 12 minutes, results are instant.

---

## Architecture

```
agent-security-scorecard/
├── app/                          # Frontend + serverless functions
│   ├── src/
│   │   ├── data/
│   │   │   ├── questions.ts      # 20 questions, 5 domains, ASI mapping
│   │   │   └── scoring.ts        # Scoring engine, archetypes, severity ranking
│   │   ├── components/           # React components (Landing, Assessment, Results)
│   │   └── utils/                # PDF generation, analytics, UTM tracking
│   ├── functions/                # Cloudflare Pages Functions (email subscribe)
│   ├── public/                   # Static assets (icons, fonts, OG image)
│   ├── wrangler.toml             # Cloudflare Pages config
│   └── package.json
├── agentic-ai-security-assessment-spec.md   # Product & build spec (reference)
└── agent-scorecard-v2-improvement-brief.md  # Engineering change log
```

### Tech stack

- **Frontend:** React 19 + TypeScript + Vite
- **Charts:** Chart.js (radar visualization)
- **PDF:** jsPDF (client-side report generation)
- **Hosting:** Cloudflare Pages (static + Pages Functions)
- **Email:** Beehiiv integration for newsletter + PDF delivery
- **Styling:** CSS Modules

---

## How scoring works

Each question uses a **0–3 maturity scale**:

| Score | Meaning |
|-------|---------|
| 0 | Absent — no control in place |
| 1 | Ad hoc — done inconsistently, no standard |
| 2 | Defined — standardized and documented |
| 3 | Managed — enforced, monitored, verified |
| N/A | Not applicable (counts as 0 for scoring, tracked separately) |

- **Domain score** = mean of 4 answers, normalized to 0–100
- **Global score** = mean of all 5 domain scores (equal weight)
- **Archetype** = deterministic shape analysis (7 rules, top-to-bottom)
- **Top-3 risks** = risk score = `(3 − answer) × severity_weight`, selected with domain diversity

The full scoring engine is a pure function in [`app/src/data/scoring.ts`](app/src/data/scoring.ts). No backend, no data collection.

---

## Running locally

```bash
cd app
npm install
npm run dev          # Starts Vite dev server at localhost:5173
```

To preview the production build:

```bash
npm run build
npm run preview
```

To deploy via Cloudflare:

```bash
npx wrangler pages deploy dist
```

---

## Credits

Built by [Amine](https://aminrj.com) at [Molntek](https://molntek.com). Grounded in the [OWASP Top 10 for Agentic Applications 2026](https://owasp.org/www-project-top-10-for-large-language-model-applications/).

This tool is a lead instrument for the **Molntek AI Security Sprint** — a focused engagement that closes the gaps surfaced in your assessment.

---

## License

MIT
