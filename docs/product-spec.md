# Agentic AI Security Posture Assessment — Product & Build Spec

**Working name:** *Agent Security Scorecard* (alt: "Are Your Agents Locked Down?" / "Least-Agency Self-Check")
**Audience:** Security engineers, AppSec/platform leads, CISOs assessing agentic AI risk
**Purpose:** Lead magnet + benchmarking tool. 20 scored questions, 5 domains, radar visualization, prioritized remediation, email-gated full report.
**Status of grounding:** Domain content is mapped to the **OWASP Top 10 for Agentic Applications 2026** (ASI01–ASI10, released Dec 2025) — the current authoritative agentic framework, not the older LLM Top 10. This is the spec's primary moat.

---

## 1. Competitive Gap Analysis

Five real categories, what each solves, where it breaks for agentic deployers, and your wedge.

### 1.1 Static checklists & framework documents — OWASP LLM Top 10, OWASP Agentic Top 10 (2026), MITRE ATLAS, NIST AI RMF

- **Solves:** Shared vocabulary and a canonical risk taxonomy. The OWASP Agentic 2026 list (ASI01 Agent Goal Hijack, ASI02 Tool Misuse, ASI03 Identity & Privilege Abuse, ASI04 Supply Chain, ASI05 Unexpected Code Execution, ASI06 Context/Memory Poisoning, ASI07 Insecure Inter-Agent Comms, ASI08 Cascading Failures, ASI09 Human-Agent Trust Exploitation, ASI10 Rogue Agents) is genuinely good and now the reference point.
- **Where it falls short:** It tells you *what the risks are*, never *where you specifically stand*. NIST AI RMF is governance-level and non-operational; MITRE ATLAS is a threat taxonomy, not a posture instrument. A practitioner reads the PDF, nods, and still cannot answer "are *we* exposed to ASI03 right now?" There is no scoring, no self-position, no per-org output.
- **Your wedge:** You are the *interactive scoring layer on top of the framework everyone already trusts*. You don't compete with OWASP — you operationalize its newest list into a 12-minute diagnostic. "OWASP tells you the ten risks; this tells you which three are bleeding in your stack."

### 1.2 GRC / compliance posture platforms — Vanta, Drata, Secureframe, OneTrust, RSA Archer

- **Solves:** Continuous control monitoring and audit evidence for SOC 2 / ISO 27001.
- **Where it falls short:** Zero AI-agent-native content. Their control libraries are framed around traditional asset classes (servers, SaaS, access reviews). An agent that holds OAuth tokens, forms intent at runtime, and chains tool calls does not map to a Vanta control. They also target *compliance owners*, not the engineer wiring an MCP server at 11pm.
- **Your wedge:** Practitioner-grade, agent-native questions GRC tools structurally can't ask. You speak in tool-scopes, OAuth on-behalf-of confusion, and memory poisoning — not "do you have an access review policy."

### 1.3 Adversarial testing tools — Promptfoo, PyRIT, Garak, DeepTeam

- **Solves:** "Does this specific prompt/model leak or jailbreak?" Empirical red-team signal at the model layer.
- **Where it falls short:** They answer a *unit-test* question, not an *organizational posture* question. They require you to already have a target, write configs, and interpret output. They say nothing about identity sprawl, agent inventory, inter-agent trust, or who owns AI security in your org. As DeepTeam itself notes, model-layer testing must be paired with runtime monitoring, access controls, and infra security that the tool doesn't cover.
- **Your wedge:** You're the *map* that tells someone they should go run Promptfoo on domain X — and that their real gap is actually ungoverned agent identity, which no fuzzer will surface.

### 1.4 Emerging agent-identity / runtime-governance startups — CyberArk-style agent identity, Agentic Fabriq, "chaperone"/policy-enforcement layers

- **Solves:** Runtime least-privilege, token exchange, per-agent identity, audit trails. This is the hottest 2026 category ("every AI agent is an identity").
- **Where it falls short:** They are *products you buy and integrate*, with sales cycles and cost. A practitioner in week one of agent deployment isn't ready to procure — Bessemer's own CISO guidance is literally "align on risk posture *before* buying anything." There is a pre-purchase diagnostic gap these vendors don't fill (and don't want to fill neutrally, since they're selling a layer).
- **Your wedge:** You occupy the vendor-neutral diagnostic slot *upstream* of procurement. You're the thing a CISO runs to define the problem before a single vendor demo. That neutrality is a feature these vendors can't credibly replicate.

### 1.5 Bespoke consulting assessments — Mandiant, CrowdStrike, big-4 AI risk practices

- **Solves:** Deep, tailored, defensible assessment with a human expert.
- **Where it falls short:** Expensive, slow, and inaccessible to the startup/mid-market engineer who needs an answer this afternoon. The output is a 40-page PDF weeks later.
- **Your wedge:** Instant, free, self-serve — and (critically for *you*, Amine) a top-of-funnel for exactly the Molntek "AI Security Sprint" engagement. The free tool ends where your paid sprint begins.

**One-line positioning that survives all five:** *The only vendor-neutral, agent-native self-diagnostic that scores you against the OWASP Agentic 2026 list in 12 minutes and tells you which three risks to fix first.*

---

## 2. Validated Pain Points

Drawn from current practitioner discourse (Bessemer CISO primer, OWASP ASI 2026 incident data, agent-security engineering writeups, identity-vendor field notes). Each is real, underserved, and answerable by an assessment.

### Pain 1 — "I have no inventory of what agents exist or what they can touch"
- **The pain:** Most enterprises have no accurate map of which agents exist, what permissions they hold, who authorized them, and what they were built to do. Without it, everything downstream is guesswork. (This is the #1 CISO-stated gap.)
- **Current workaround:** Spreadsheets, tribal knowledge, "ask the platform team." Usually nothing.
- **How the tool answers it:** The Governance & Inventory domain forces the question explicitly and scores the absence. A "0" on "Do you have a live inventory of deployed agents and their granted scopes?" is itself the wake-up.

### Pain 2 — "Agent permissions are way too broad and least-privilege fights autonomy"
- **The pain:** The *autonomy–permission paradox* — agents need broad access to be useful, which directly violates least privilege. OWASP's 2026 answer is the new principle of **least agency**, but practitioners have no way to measure how far they are from it.
- **Current workaround:** Over-provision now, promise to tighten later (which never happens).
- **How the tool answers it:** Identity & Access domain scores scope-minimization, just-in-time/task-scoped credentials, and per-agent identity. Converts a vague unease into a measured gap against "least agency."

### Pain 3 — "Prompt injection / context poisoning is treated as an afterthought"
- **The pain:** Agents can't reliably separate instructions from data, so poisoned emails, PDFs, calendar invites, RAG docs, and web content silently hijack goals (ASI01/ASI06). Teams know this abstractly but ship without input-trust boundaries.
- **Current workaround:** "We'll add a guardrail later," or a single output filter that catches nothing inbound.
- **How the tool answers it:** Input Trust & Cognition domain scores whether external content is treated as untrusted, whether high-impact actions require re-validated intent, and whether retrieval sources are integrity-checked.

### Pain 4 — "We have zero visibility into what agents actually did, and can't replay it"
- **The pain:** Monitoring tells you what an agent did; guardrails decide what it's *allowed* to do — and most teams have neither end-to-end auditability nor action-level boundaries. Cascading failures (ASI08) and rogue agents (ASI10) are invisible until they detonate.
- **Current workaround:** App logs that capture API calls but not agent reasoning/tool-call chains.
- **How the tool answers it:** Detection & Response domain scores action-level audit trails, replayability, anomaly detection on agent behavior, and a kill-switch/containment path.

### Pain 5 — "No one owns AI security in my org / we expected to just *know* it"
- **The pain:** Ownership vacuum. Security thinks platform owns it; platform thinks security owns it; the agents ship anyway. Bessemer's guidance puts "ownership first, then constraints, then monitoring."
- **Current workaround:** Nobody. It surfaces after an incident.
- **How the tool answers it:** Governance domain scores explicit ownership, an approval gate for new agents, and a defined risk posture (all-in / cautious / wait-and-see). Naming the vacuum is the value.

---

## 3. Positioning & Differentiation

How this avoids "just another checklist."

### Content depth — ground it in ASI 2026, not the LLM Top 10
The single biggest differentiator: **map every question to a specific ASI01–ASI10 control and cite it in the output.** Most repackaged tools still ride the 2024 LLM Top 10. Being demonstrably built on the December 2025 Agentic list — released by 100+ contributors with a NIST/EU-reviewed board — is instant credibility and is *current*. Each result line reads like "Weak on **ASI06 Context & Memory Poisoning** — here's why and here's the fix," which no generic checklist does.

### Output quality — diagnosis, not a number
Avoid the "I got 62%, now what?" trap with three mechanisms:
1. **Per-domain maturity band** (not just a global %), so the user sees *where* they're weak, not an averaged-away blur.
2. **Top-3 prioritized remediations** ranked by *risk-weighted gap* (impact × distance-from-target), each tied to an ASI item, a concrete first action, and a "how to verify you fixed it" check.
3. **A named overall archetype** (see §5) that gives identity to the result — people share an identity, not a percentage.

### Distribution angle — the shareable archetype + benchmark
The viral unit is not the score; it's *"I'm an 'Optimistic Adopter' — most teams deploying agents are. 71% of us have no agent inventory."* A self-deprecating, relatable archetype + a peer benchmark stat is eminently postable on LinkedIn/X. (See §7.)

### Moat — why Vanta/OWASP can't clone it in a weekend
- **Content moat:** The question bank is opinionated, agent-native, and ASI-mapped. That mapping + the remediation library is the actual IP, and it's *maintained* as ASI evolves (2027 list will shift). A weekend clone copies the UI, not the calibrated question/remediation/benchmark logic.
- **Neutrality moat:** OWASP won't build a scored commercial-feeling diagnostic; Vanta's would be a funnel to Vanta. Your neutrality + practitioner voice is positioning they can't occupy without contradicting themselves.
- **Data moat (compounding):** Once you have N submissions, the benchmark ("you vs. peers") becomes real and self-reinforcing. A cloner starts at zero benchmark data.
- **Author moat:** It's attached to a credible OWASP contributor (you) and a newsletter. The trust transfers; a faceless clone has none.

---

## 4. Domain Architecture + Question Proposals

Five domains, each mapped to ASI items, 4 questions each = **20 questions**. Completable in 10–15 min.

**Scoring scale (all questions):** 0–3 maturity scale, chosen over yes/no because it captures the "we sort of do this" reality and produces a smooth radar.

- **0 — Absent:** Not done / not aware.
- **1 — Ad hoc:** Done inconsistently, no standard, person-dependent.
- **2 — Defined:** Standardized and documented, partial coverage.
- **3 — Managed:** Enforced, monitored, and verified across all agents.

Each question carries an optional **"N/A — we don't do this yet"** that maps to 0 but is tracked separately so the remediation copy can say "you haven't deployed X" vs. "you deployed X insecurely" — different advice.

Domain score = mean of its 4 answers, normalized to 0–100. Global score = mean of domain scores (equal weight in v1; see §6 for why not risk-weighted in v1).

---

### Domain A — Agent Inventory & Governance
*Maps to: ASI10 Rogue Agents, cross-cutting ownership. Addresses Pain 1 & 5.*

What it covers: Do you know your agents exist, who owns them, and is there a gate before they ship.

1. **Do you maintain a live inventory of every deployed agent, including the tools and scopes each one can access?** (0 none → 3 live, automated, includes scopes)
2. **Is there a single named owner accountable for AI agent security in your org?** (0 nobody → 3 explicit owner with mandate)
3. **Must a new agent pass a security review/approval gate before reaching production?** (0 self-serve to prod → 3 enforced gate with sign-off)
4. **Have you defined an organizational risk posture for agents (all-in / cautious / wait-and-see) that guides what agents are allowed to do?** (0 undefined → 3 documented and enforced)

---

### Domain B — Identity, Access & Least Agency
*Maps to: ASI02 Tool Misuse, ASI03 Identity & Privilege Abuse. Addresses Pain 2.*

What it covers: Whether agents get their own scoped identity and the minimum agency to do the job.

1. **Does each agent have its own managed identity (not a shared/human service account)?** (0 shared keys → 3 per-agent managed identity)
2. **Are agent permissions scoped to the minimum tools/data needed for a specific task ("least agency")?** (0 broad standing access → 3 task-scoped minimum)
3. **Do you use just-in-time / short-lived, task-scoped credentials rather than long-lived tokens?** (0 long-lived secrets → 3 JIT short-lived)
4. **When an agent acts on behalf of a user, is the user's identity and authorization propagated and enforced (no on-behalf-of confusion)?** (0 agent acts as itself with god rights → 3 enforced user-scoped propagation)

---

### Domain C — Input Trust & Cognition Integrity
*Maps to: ASI01 Agent Goal Hijack, ASI06 Context & Memory Poisoning. Addresses Pain 3.*

What it covers: Whether external/retrieved content is treated as untrusted and whether memory can be poisoned.

1. **Is all external content (emails, docs, web, RAG sources, tool outputs) treated as untrusted input that cannot directly issue instructions?** (0 trusted → 3 enforced instruction/data separation)
2. **Are high-impact or goal-changing actions gated by re-validated intent or human approval?** (0 agent acts autonomously on any inferred goal → 3 enforced re-validation for high-impact)
3. **Is the integrity/provenance of retrieval and memory stores verified to prevent poisoning across sessions?** (0 unverified shared memory → 3 integrity-checked, scoped per session/tenant)
4. **Do you test agents against prompt-injection / goal-hijack scenarios before and after deployment?** (0 never → 3 continuous adversarial testing, e.g. Promptfoo/PyRIT/Garak in CI)

---

### Domain D — Execution & Supply Chain Safety
*Maps to: ASI04 Supply Chain Compromise, ASI05 Unexpected Code Execution, ASI07 Insecure Inter-Agent Comms. Addresses the under-covered build/runtime layer.*

What it covers: Sandboxing of actions, trust in tools/skills/MCP servers, and safe agent-to-agent comms.

1. **Is agent-generated code or commands executed in a sandboxed/isolated environment with constrained blast radius?** (0 runs with host privileges → 3 sandboxed, least-privilege execution)
2. **Do you vet and pin the provenance of third-party tools, MCP servers, and agent skills before connecting them?** (0 connect anything → 3 vetted, pinned, provenance-checked) — *note: 2026 saw the first agent-skill registry poisoned at scale and SSRF-vulnerable MCP servers found in the wild, so this question lands hard.*
3. **Are inter-agent / agent-to-tool communications authenticated and integrity-protected (not implicit trust)?** (0 open trust → 3 authenticated + policy-controlled)
4. **Are dangerous capabilities (shell, file write, network egress, payment/email send) explicitly allow-listed per agent rather than available by default?** (0 default-allow → 3 explicit per-agent allow-list)

---

### Domain E — Detection, Response & Containment
*Maps to: ASI08 Cascading Failures, ASI09 Human-Agent Trust Exploitation, ASI10 Rogue Agents. Addresses Pain 4.*

What it covers: Whether you can see, replay, and stop agent misbehavior.

1. **Do you log agent actions at the action/tool-call level (not just API calls) with enough detail to replay a decision chain?** (0 thin app logs → 3 full replayable action audit trail)
2. **Do you have anomaly/behavior monitoring that flags when an agent deviates from its intended purpose?** (0 none → 3 active behavioral monitoring with alerts)
3. **Is there a kill-switch / containment path to immediately revoke an agent's access or halt it?** (0 none → 3 tested one-click containment)
4. **Do you have controls against an agent persuading a human into unsafe approvals (trust-exploitation), e.g. mandatory human verification on high-stakes outputs?** (0 humans rubber-stamp → 3 enforced independent verification)

---

## 5. Results & Output Design

### Maturity bands (global, 0–100)
Four bands — named for identity and shareability, not clinical levels:

| Band | Range | Definition |
|------|-------|------------|
| **Exposed** | 0–25 | Agents in production with little to no agent-specific security. Operating on hope. High likelihood of an undetected incident. |
| **Reactive** | 26–50 | Some controls exist ad hoc. You'd detect a loud failure but not a quiet compromise. Most teams shipping agents land here. |
| **Managed** | 51–75 | Defined, documented controls across most domains. You can answer "where are we weak" with evidence. |
| **Resilient** | 76–100 | Enforced least agency, full auditability, tested containment. Agents treated as production infrastructure. |

### Shareable archetype (the viral unit)
Compute a lightweight **archetype** from the *shape* of the radar, not just the score. Examples:
- **"The Optimistic Adopter"** — high deployment, low Identity + Detection. ("Moving fast, low brakes.")
- **"The Locked-Down Skeptic"** — high Governance/Identity, low deployment breadth.
- **"The Blind Operator"** — decent controls, near-zero Detection/Response.
- **"The Lab Tinkerer"** — strong cognition/testing, weak governance & inventory.

The archetype + one peer-benchmark stat is what gets posted. Archetype is derived client-side from domain-score thresholds (deterministic rules, no ML needed for v1).

### Results page anatomy (avoiding "62%, now what?")
1. **Headline:** Archetype name + band + global score, as a single shareable card.
2. **Radar chart:** 5 domains, your score vs. a dashed "target" ring (the Resilient threshold) — the gap is the story.
3. **"Your three biggest risks":** Top-3 lowest-scoring questions, each rendered as:
   - The mapped **ASI item** (e.g. "ASI03 — Identity & Privilege Abuse")
   - *Why it matters* (one plain sentence)
   - *First action this week* (one concrete step)
   - *How to verify* (the check that proves it's fixed)
4. **Full domain breakdown:** each domain's band + the one-line "what good looks like."
5. **Benchmark line:** "You scored higher than X% of teams who've taken this" (once data exists; until then, show a static "most teams land in Reactive" honest framing — do *not* fabricate a percentile).
6. **CTA:** email-gated downloadable report + newsletter, and a soft hand-off to the paid Sprint for "Exposed/Reactive" results.

### What drives signups & sharing
- **Email unlocks the full PDF report** (the radar + all 20 answers + full remediation roadmap mapped to ASI). The on-screen result is enough to be satisfying; the PDF is the lead-gen asset — this is the proven maturity-scan pattern (instant on-screen value, richer gated report).
- **Pre-filled share card** (auto-generated PNG/text) with archetype + score, one click to LinkedIn/X.
- **Result is shareable without the email** — gating the *score* kills virality; gate the *depth*.

---

## 6. Technical Spec (No Code)

### User flow
1. **Landing** — headline hook, "12 minutes, no login, get your agent security score." One primary CTA: *Start assessment*.
2. **Optional context (1 screen, skippable):** company size, # agents in prod, deployment stage. Used only for archetype/benchmark segmentation — never required.
3. **Assessment** — 20 questions, paginated 4-per-domain (5 screens) or one-per-screen with a progress bar. Each question shows the 0–3 options as labeled radio cards + an "N/A — not yet" option. Domain intro micro-copy frames each section. All state in memory/URL — no backend.
4. **Computing screen** — brief, then results.
5. **Results page** — §5 anatomy. Radar + archetype + top-3 + domain bands render immediately, client-side.
6. **Email gate** — "Get your full remediation roadmap (PDF) + the AI Security Intelligence newsletter." Email POSTs to your ESP (Beehiiv) endpoint — the *only* server interaction.
7. **Share** — pre-filled card, copy-link (link encodes answers so a shared link reproduces the result).
8. **Soft hand-off** — contextual CTA to Molntek Sprint for low-band results.

### Data model (all client-side JSON)

```
Domain        { id, name, asi_refs[], intro_copy }
Question      { id, domain_id, text, asi_ref, scale_labels[0..3], na_label,
                why_it_matters, first_action, how_to_verify }
Answer        { question_id, value (0–3 | "na") }
DomainResult  { domain_id, raw_mean, normalized_0_100, band }
Result        { global_score, global_band, archetype,
                domain_results[], top3_risks[], radar_data[] }
```

- **Scoring:** domain_normalized = (mean of 4 answers / 3) × 100; "na" counts as 0 for scoring but flips remediation copy. Global = mean of 5 domain scores.
- **Bands:** static thresholds (§5).
- **Archetype:** deterministic rule set over domain scores (if Detection<40 and Governance<40 and deployment=high → "Optimistic Adopter", etc.). Pure functions, fully testable.
- **Top-3 risks:** sort answered questions ascending by value; tie-break by ASI severity rank. v1 uses raw lowest scores (simple, explainable). *Risk-weighting deferred — see below.*

### Output formats
- **On-screen:** interactive radar + cards (immediate, ungated).
- **Email/PDF:** branded report — cover with archetype/score, radar image, all 20 answers, full ASI-mapped remediation roadmap, "what good looks like" per domain. Generated client-side (e.g. render to PDF in-browser) or via a tiny serverless function if needed; keep it static if at all possible.

### Minimal viable v1 feature set
- 20-question assessment, 0–3 scale + N/A.
- Client-side scoring, 5 bands→4, deterministic archetype.
- Radar chart + top-3 ASI-mapped remediations on-screen.
- Email capture → Beehiiv.
- Shareable result link (answers encoded in URL) + pre-filled share card.
- Static "most teams land in Reactive" framing until real benchmark data exists.

### Deliberately skipped in v1 (and why)
- **Risk-weighted scoring** — adds calibration burden and is hard to defend without data; equal-weight is honest and explainable for v1. Add weights once you have submission data.
- **Live peer-percentile benchmark** — requires stored submissions; fabricating it is a credibility risk. Ship honest static framing; turn on real percentiles after N submissions (this is also your data moat, so it's worth doing *later, properly*).
- **Accounts / saved history / re-assessment tracking** — no backend in scope; defer.
- **PDF personalization beyond the computed result** — keep the report templated.
- **Multi-language** — Nordic/EU audience reads technical English; defer.
- **AI-generated custom advice per answer** — tempting (and on-brand for you), but non-deterministic output undercuts the "credible diagnostic" trust and adds an API dependency/cost to a lead magnet. Use a curated remediation library in v1; consider an optional "explain my result" AI feature in v2.

---

## 7. Go-to-Market Signals

### Where the audience is
- **Communities:** OWASP GenAI/Agentic Slack and chapter channels (your home turf), r/netsec, r/cybersecurity, r/MachineLearning (security threads), Hacker News (Show HN), LinkedIn AI-security circles, the Latent Space / MLSecOps adjacent communities, and CFP/conference audiences you're already targeting (SEC-T, hack.lu, AGNTCon/MCPCon).
- **Newsletters:** cross-promote in AI Security Intelligence (yours), tl/dr sec, Detection Engineering, Last Week in AI-security roundups.
- **LinkedIn groups / hashtags:** #AIsecurity, #AgenticAI, #MCP, #LLMsecurity, OWASP GenAI follower base.

### Hooks / headlines that work for assessment lead magnets
- "What's your agent security score? (12 minutes, no signup to see it)"
- "Most teams deploying AI agents are 'Exposed.' Are you?"
- "You shipped an AI agent. Can you answer these 20 questions?"
- "Score your agents against the OWASP Agentic Top 10 — instantly."
- "We expected to 'just know' AI agent security. This tells you what you don't."
- Counter-intuitive stat hook (once you have data): "71% of teams can't list their own agents."

### The shareable moment
The post writes itself when the result hands someone:
1. **A relatable identity** — "I'm an *Optimistic Adopter* 😅" is self-aware, low-status-risk, and funny — people share self-deprecation about a problem everyone has.
2. **A peer stat** — "...and apparently so is everyone else shipping agents."
3. **A flex path** — "Resilient" scorers post to signal competence; "Exposed" scorers post to signal awareness. Both ends share, which is the mark of a good viral mechanic.

Make the share card auto-generate with the archetype, score, radar thumbnail, and a clean URL back to the tool. One tap to LinkedIn.

### Launch sequence (fits your existing pipeline)
1. Soft-launch the link in OWASP Slack + your newsletter for calibration feedback.
2. LinkedIn post with *your own* result as the hook ("I built this and scored myself — here's what I got wrong").
3. Show HN once polished.
4. Use it as the interactive close in your next conference talk — live-poll the room's archetype.
5. Wire low-band results to the Molntek Sprint CTA; the free tool becomes the top of your consulting funnel.

---

## Appendix — ASI 2026 mapping reference

| Domain | Questions map to |
|--------|------------------|
| A — Inventory & Governance | ASI10, cross-cutting ownership |
| B — Identity, Access & Least Agency | ASI02, ASI03 |
| C — Input Trust & Cognition | ASI01, ASI06 |
| D — Execution & Supply Chain | ASI04, ASI05, ASI07 |
| E — Detection, Response & Containment | ASI08, ASI09, ASI10 |

*Full ASI01–ASI10: ASI01 Agent Goal Hijack · ASI02 Tool Misuse & Exploitation · ASI03 Agent Identity & Privilege Abuse · ASI04 Agentic Supply Chain Compromise · ASI05 Unexpected Code Execution · ASI06 Context & Memory Poisoning · ASI07 Insecure Inter-Agent Communication · ASI08 Cascading Agent Failures · ASI09 Human-Agent Trust Exploitation · ASI10 Rogue Agents. Source: OWASP Top 10 for Agentic Applications 2026.*
