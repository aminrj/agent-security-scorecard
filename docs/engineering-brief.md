# Agent Security Scorecard — v2 Improvement Brief

**To:** the coding agent maintaining `agent-security-scorecard`
**From:** product owner (Molntek)
**Re:** Fixes and exact specifications based on a real completed run (PDF report, score 48/100, archetype "Cautious Builder")

Read this whole document before changing code. Every section gives you the *current behavior*, the *problem*, and the *exact target behavior* including literal copy and logic. Where I give code, treat variable names and thresholds as authoritative. Do not improvise alternatives. Do not add features not listed here. If something is genuinely ambiguous after reading, stop and ask — do not guess.

The build is fundamentally sound. The question bank, the 0–3 anchors, the ASI mapping, and the remediation cards are good and must be preserved. This brief is about six specific defects, in priority order. Fix them in order. Do not refactor anything not named here.

---

## Context: what the current build produced

A run with these domain scores:

| Domain | Score | Band |
|--------|-------|------|
| A. Inventory & Governance | 58 | Managed |
| B. Identity & Access | 17 | Exposed |
| C. Cognition Integrity | 83 | Resilient |
| D. Supply Chain | 42 | Reactive |
| E. Detection & Response | 42 | Reactive |
| **Global** | **48** | **Reactive** |

…produced the archetype **"Cautious Builder"** with the copy *"Balanced posture — methodically building controls alongside deployment. Well-positioned for scale."*

That output is **wrong and dangerous**, and it is defect #1. The posture is not balanced: Cognition is 83 while Identity is 17, there are three 0/3 answers on identity, no kill-switch (0/3), and humans rubber-stamp agent approvals (0/3). Reassuring copy on this radar shape actively undermines the tool's credibility. The rest of this document fixes that and five other issues.

---

## DEFECT 1 — Archetype logic produces reassuring labels for dangerous postures (CRITICAL)

### Current behavior
The archetype appears to be derived primarily from the global score or from a deployment/maturity axis, and it ignores the *shape* (variance and which specific domains are weak). A 48/100 with a gaping Identity hole was labeled "Cautious Builder — balanced posture, well-positioned for scale."

### Why this is the top priority
The archetype is the emotional headline of the entire report and the shareable unit. If it tells a practitioner with no kill-switch and shared agent identities that they're "balanced" and "well-positioned," the tool is lying to exactly the audience it must earn trust from. A reassuring label on a dangerous posture is the single worst failure mode this product has.

### Target behavior

Replace the archetype function entirely with the deterministic rules below. The archetype must be derived from the **shape** of the five domain scores, not the global average. Implement exactly this, evaluated **top to bottom, first match wins**.

Define these helpers first:

```
domains = { A, B, C, D, E }   // each 0–100
globalScore = mean(A, B, C, D, E)
maxGap = max(domains) - min(domains)
weakDomains = domains where score < 40
strongDomains = domains where score >= 70

// "Containment" = Domain E. "Identity" = Domain B. "Governance/Inventory" = Domain A.
```

Evaluate in this order:

```
1. LOPSIDED / DANGEROUS-SHAPE  (check FIRST, before any "balanced" label)
   IF maxGap >= 35 AND min(domains) < 40:
     archetype = "The Lopsided Fortress"
     tagline   = "You've hardened the sophisticated risks while leaving a basic one wide open.
                  Your weakest domain undoes the work in your strongest."

2. EXPOSED (low everywhere)
   IF globalScore < 30:
     archetype = "Flying Blind"
     tagline   = "Agents are in production with little agent-specific security.
                  This is the highest-urgency band — start with identity and containment."

3. BLIND OPERATOR (controls exist but can't see/stop agents)
   IF E < 40 AND globalScore >= 40:
     archetype = "The Blind Operator"
     tagline   = "You have controls, but little visibility into what agents do and no fast way
                  to stop them. You'd miss a quiet compromise."

4. OPTIMISTIC ADOPTER (shipping fast, weak identity/containment)
   IF (B < 50 OR E < 50) AND C >= 60:
     archetype = "The Optimistic Adopter"
     tagline   = "Moving fast on capability, light on the brakes. Your cognition defenses are
                  ahead of your identity and containment controls."

5. LOCKED-DOWN SKEPTIC (strong governance/identity, weak elsewhere/low deployment)
   IF A >= 60 AND B >= 60 AND globalScore < 65:
     archetype = "The Locked-Down Skeptic"
     tagline   = "Strong governance and identity foundations, with room to extend the same rigor
                  to execution and detection."

6. RESILIENT (genuinely strong and even)
   IF globalScore >= 75 AND maxGap < 35:
     archetype = "The Resilient Operator"
     tagline   = "Enforced least agency, real auditability, tested containment.
                  Agents are treated as production infrastructure."

7. DEFAULT — even, mid maturity
   archetype = "The Methodical Builder"
   tagline   = "Controls are developing evenly across domains. No single catastrophic gap,
                but no domain is fully managed yet."
```

**For the example run** (A58 B17 C83 D42 E42): maxGap = 83−17 = 66 ≥ 35, and min = 17 < 40 → rule 1 fires → **"The Lopsided Fortress."** That is the correct, honest label. Verify your implementation produces exactly this for that input.

### Acceptance criteria
- A58 B17 C83 D42 E42 → "The Lopsided Fortress". Never "Cautious Builder" or any reassuring label.
- Add a unit test for each of the 7 rules with one input that triggers it.
- The word "balanced" must NOT appear in any archetype tagline that can fire when `min(domains) < 40`.
- Remove the old "Cautious Builder" archetype and its copy entirely.

---

## DEFECT 2 — Top-3 risk selection clusters by ASI number and drops equally-severe risks (HIGH)

### Current behavior
Top-3 was: ASI03 (identity, 0/3), ASI03 (on-behalf-of, 0/3), ASI10 (inventory, 0/3). The selection is "lowest score, tie-break by ASI number," which buries equally-critical 0/3 findings — specifically **no kill-switch (E, 0/3)** and **humans rubber-stamp approvals (E, 0/3)** — both of which are at least as urgent as agent inventory. The result reads as "you have an identity problem" when the user equally has a containment problem.

### Target behavior

Re-implement top-3 selection with **severity weighting** and **domain diversity**, exactly as follows.

**Step 1 — assign each question a severity rank** (author this as a static map keyed by question id). Higher = more urgent to fix when scored low. Use this ordering (1 = most severe):

```
SEVERITY (1 = fix first):
1  E-Q3  No kill-switch / containment path        (can't stop a rogue agent)
2  B-Q1  Shared agent identity                     (no attribution, privilege explosion)
3  B-Q4  On-behalf-of confusion                    (privilege escalation via agent)
4  E-Q4  Humans rubber-stamp approvals             (trust exploitation, ASI09)
5  D-Q2  Unvetted third-party tools/MCP/skills     (supply-chain RCE, ASI04)
6  C-Q1  External content can issue instructions   (prompt injection, ASI01)
7  D-Q1  Unsandboxed code execution                (ASI05)
8  A-Q1  No agent inventory                        (ASI10)
9  C-Q3  Memory poisoning unprotected              (ASI06)
10 B-Q2  No least-agency scoping                   (ASI03)
... (rank the remaining questions; supply a full 1–20 map, no ties)
```

You must produce a complete 1–20 severity map with no duplicate ranks. The above is the required ordering for the top items; rank the rest sensibly and keep it in a single `SEVERITY_RANK` constant.

**Step 2 — compute a risk score for each answered question:**

```
gap = 3 - answerValue            // 0..3; "na" counts as answerValue 0 → gap 3
severityWeight = (21 - severityRank)   // rank 1 → 20, rank 20 → 1
riskScore = gap * severityWeight
```

**Step 3 — select top-3 with domain diversity:**

```
sort all questions by riskScore DESC, tie-break by severityRank ASC
pick #1 (highest riskScore)
pick #2 = highest riskScore from a DIFFERENT domain than #1
pick #3 = highest riskScore from a domain not already used by #1 and #2,
          UNLESS doing so would skip a strictly higher riskScore by >= 15 points,
          in which case take the higher riskScore regardless of domain
```

The diversity rule prevents three identity items from monopolizing the list while still letting a genuinely dominant single-domain risk through.

**For the example run**, riskScores (gap × weight):
- E-Q3 kill-switch: gap3 × 20 = **60**
- B-Q1 shared identity: gap3 × 19 = **57**
- B-Q4 on-behalf-of: gap3 × 18 = **54**
- E-Q4 rubber-stamp: gap3 × 17 = **51**
- A-Q1 inventory: gap3 × 13 = **39**

Selection: #1 = E-Q3 (60, domain E). #2 = B-Q1 (57, domain B, different). #3 = next from a new domain is A-Q1 (39, domain A), but B-Q4 (54) is higher by 15 exactly — rule says skip diversity only if higher by **>= 15**, 54−39 = 15, so take B-Q4. Final top-3: **E-Q3 (kill-switch), B-Q1 (shared identity), B-Q4 (on-behalf-of).**

That correctly surfaces the containment gap as the #1 fix, which the current build hides entirely. Verify your output matches.

### Acceptance criteria
- The example run surfaces E-Q3 (kill-switch) as risk #1.
- `SEVERITY_RANK` is a complete, duplicate-free 1–20 map.
- Unit test: an all-zero assessment returns the three highest-severity questions, spread across at least two domains.
- "na" answers are treated as gap 3 in riskScore.

---

## DEFECT 3 — Inconsistent domain names between cover and body (MEDIUM)

### Current behavior
Cover page uses short labels ("A. Governance", "B. Identity", "C. Cognition", "D. Supply Chain", "E. Detection"). The body uses long labels ("A — Agent Inventory & Governance", "C — Input Trust & Cognition Integrity"). This looks unpolished and makes the report feel auto-generated.

### Target behavior
Define each domain once with both a `shortLabel` and `fullLabel`, and use them consistently:

```
A: shortLabel "Inventory & Governance"      fullLabel "Agent Inventory & Governance"
B: shortLabel "Identity & Access"           fullLabel "Identity, Access & Least Agency"
C: shortLabel "Cognition Integrity"         fullLabel "Input Trust & Cognition Integrity"
D: shortLabel "Execution & Supply Chain"    fullLabel "Execution & Supply Chain Safety"
E: shortLabel "Detection & Response"        fullLabel "Detection, Response & Containment"
```

Use `shortLabel` everywhere space is constrained (cover domain table, radar axis labels, share card). Use `fullLabel` for the body section headers. Same five names across PDF, web results, and share card. No domain may appear under two different names anywhere.

### Acceptance criteria
- Cover table and body headers use the agreed short/full pair for every domain.
- Radar axis labels use `shortLabel`.
- Grep the codebase: there is exactly one source of truth for domain names (one constant), referenced everywhere.

---

## DEFECT 4 — No benchmark/context line; the score floats without meaning (MEDIUM)

### Current behavior
The PDF shows "48/100 · Reactive" with no indication of whether that's typical, good, or alarming. The user has no reference point.

### Target behavior
Until real submission data exists, show an **honest static** context line — do NOT fabricate a percentile. Place it directly under the global score on both the web results page and the PDF cover.

Literal copy (use exactly, choose by band):

```
Exposed:   "Most teams just starting with agents land in Reactive. You're below that —
            the gaps below are the fastest way up."
Reactive:  "Most teams deploying agents today land here, in Reactive. The difference
            between Reactive and Managed is usually identity and containment — see below."
Managed:   "You're ahead of most teams deploying agents, who land in Reactive.
            The remaining gaps are what separate Managed from Resilient."
Resilient: "You're in the top tier. Most teams deploying agents land in Reactive.
            Treat the breakdown below as a maintenance checklist."
```

**Forward-compatibility:** structure the code so that when you later have `>= 100` stored submissions, you can swap this static string for a real percentile line ("You scored higher than X% of N teams"). Add a feature flag `USE_REAL_BENCHMARK = false` and a stub `getBenchmarkLine(band, globalScore)` that returns the static copy now and the percentile later. Do not collect or store submissions yet — that is out of scope for this brief.

### Acceptance criteria
- Benchmark line appears under the global score on web and PDF.
- The string is selected by band and matches the copy above verbatim.
- No fabricated number appears. `USE_REAL_BENCHMARK` defaults to false.

---

## DEFECT 5 — No call-to-action anywhere in the report (HIGH — this is a lead magnet)

### Current behavior
The PDF ends on page 6 on the last appendix answer ("Humans rubber-stamp... accepted without independent check") with no next step. This is the highest-intent moment in the entire funnel — the person is staring at their own bad score — and the document says nothing.

### Target behavior
Add a final **CTA block** as the last section of the PDF (new page or bottom of last page) AND a matching CTA on the web results page below the breakdown. The CTA copy must adapt to band.

For **Exposed** and **Reactive** bands, use the direct hand-off:

```
HEADING: "Want help closing these gaps?"
BODY:    "A weak identity layer with no containment path is the most common pattern we see
          in teams shipping agents — and the most fixable. The Molntek AI Security Sprint is a
          focused engagement that closes exactly the gaps in your top three above:
          per-agent identity, least-agency scoping, and a tested kill-switch."
BUTTON:  "Book a 30-min Agent Security review →"  (link to your booking URL)
SECONDARY: "Not ready? The AI Security Intelligence newsletter covers this every week →"
```

For **Managed** and **Resilient** bands, use the lighter touch:

```
HEADING: "Keep your edge"
BODY:    "You're ahead of most teams. The AI Security Intelligence newsletter covers agentic
          security developments — OWASP updates, new attack classes, and field patterns —
          every week."
BUTTON:  "Read the newsletter →"
SECONDARY: "Running a complex agent estate? A Molntek Agentic AI Security Review goes deeper →"
```

Both CTAs must reference the user's actual result (band, and for the direct version, the top-three theme) so it reads as tailored, not boilerplate. Pull the top-three domain theme dynamically (e.g. "identity and containment" if those are the weak domains).

### Acceptance criteria
- PDF has a CTA block as its final content; web results page has the same CTA below the breakdown.
- CTA copy switches correctly between the Exposed/Reactive variant and the Managed/Resilient variant.
- Booking link and newsletter link are real, configurable constants (not hardcoded inline).
- The direct-variant body references the weak domains by name, computed from the result.

---

## DEFECT 6 — No sequenced remediation roadmap across the full result (MEDIUM)

### Current behavior
The report gives a top-3 and then a flat list of all 20 answers. For a result with six 0/3 and 1/3 answers, the user has no guidance on *what order* to tackle everything beyond the top-3.

### Target behavior
Add a **"Your 30-day order of operations"** section between the top-3 and the full appendix, on both web and PDF. Generate it by taking every question scoring `<= 1` (gap >= 2), sorting by the same `riskScore` from Defect 2, and presenting the top 5–7 as a numbered, sequenced list. Each line is one sentence: the action verb + the target, derived from the question's existing `first_action` copy but compressed to a single imperative line.

Format:

```
YOUR 30-DAY ORDER OF OPERATIONS
Tackle these in order. Each builds on the last.

1. Stand up a kill-switch: one command that revokes a misbehaving agent's access. (ASI10/E)
2. Give your highest-privilege agent its own scoped identity; rotate the shared credential. (ASI03/B)
3. Propagate user identity through on-behalf-of calls; verify with a low-privilege test user. (ASI03/B)
4. Require independent human verification on high-stakes agent approvals. (ASI09/E)
5. Build a live inventory of every prod agent and its scopes. (ASI10/A)
6. Vet and pin every third-party tool / MCP server before connecting. (ASI04/D)
```

(The above is illustrative for the example run; generate dynamically from the actual `<=1` answers, ordered by riskScore. Cap at 7 items. If fewer than 3 questions score `<=1`, title it "Your priorities" and list what there is.)

Each item must carry its `(ASIxx/Domain)` tag so the sequence ties back to the framework and the appendix.

### Acceptance criteria
- Section appears between top-3 and full appendix on web and PDF.
- Items are sorted by `riskScore` (same function as Defect 2), capped at 7.
- Each item is a single imperative sentence with an `(ASIxx/Domain)` tag.
- For the example run, item 1 is the kill-switch.

---

## What must NOT change (regression guard)

Preserve all of the following exactly. If any of these changes, you've gone out of scope:

- The 20 question texts and their 0–3 anchor descriptions. They are good. Do not reword them.
- The ASI mapping per question.
- The remediation card structure: *why it matters* / *first action this week* / *how to verify*. This is the strongest part of the report — keep all three fields.
- The 4-band scale (Exposed 0–25, Reactive 26–50, Managed 51–75, Resilient 76–100) and the equal-weight global score (mean of 5 domain scores). Do NOT introduce risk-weighting into the *score* — risk-weighting belongs only in top-3 selection and the roadmap ordering (Defects 2 and 6).
- The "na" handling for scoring (na = 0 for score, tracked separately for remediation copy).
- The score-is-visible-before-email-gate behavior. Never gate the score.
- Client-side-only computation; email to ESP is the only server call.

---

## Delivery checklist

Implement in this order and confirm each before moving on:

1. [ ] Defect 1 — archetype rules rewritten; example run yields "The Lopsided Fortress"; 7 unit tests pass; "balanced" cannot fire with a sub-40 domain.
2. [ ] Defect 2 — `SEVERITY_RANK` complete 1–20; riskScore + diversity selection; example run yields kill-switch as risk #1.
3. [ ] Defect 5 — band-adaptive CTA on PDF and web; links configurable.
4. [ ] Defect 6 — 30-day order-of-operations section, dynamically generated, capped at 7.
5. [ ] Defect 3 — single domain-name constant; short/full labels used consistently.
6. [ ] Defect 4 — honest static benchmark line; `USE_REAL_BENCHMARK` flag stubbed.
7. [ ] Regression guard — confirm nothing in the "must not change" list moved.

When done, re-run the exact example input (A58 B17 C83 D42 E42, with the per-question answers from the original PDF appendix) and produce a fresh PDF. The new PDF must show: archetype "The Lopsided Fortress", top-3 led by the kill-switch, a benchmark line, a 30-day roadmap, a band-appropriate CTA, and consistent domain names. Attach that PDF for review.
