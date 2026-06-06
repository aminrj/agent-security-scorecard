import { DOMAINS, QUESTIONS, type Question } from './questions';

export type AnswerValue = 0 | 1 | 2 | 3 | 'na';

export interface Answers {
  [questionId: string]: AnswerValue;
}

export interface DomainResult {
  domain_id: string;
  domain_name: string;
  raw_mean: number;
  normalized: number;
  band: Band;
}

export type Band = 'Exposed' | 'Reactive' | 'Managed' | 'Resilient';

export type Archetype =
  | 'The Lopsided Fortress'
  | 'Flying Blind'
  | 'The Blind Operator'
  | 'The Optimistic Adopter'
  | 'The Locked-Down Skeptic'
  | 'The Resilient Operator'
  | 'The Methodical Builder';

export interface TopRisk {
  question: Question;
  value: AnswerValue;
  domain_name: string;
  domain_color: string;
}

export interface RoadmapItem {
  question: Question;
  action: string;
  asi_tag: string;
  riskScore: number;
}

export interface AssessmentResult {
  global_score: number;
  global_band: Band;
  archetype: Archetype;
  archetype_subtitle: string;
  benchmark_line: string;
  domain_results: DomainResult[];
  top3_risks: TopRisk[];
  roadmap_items: RoadmapItem[];
  radar_data: number[];
}

export interface ContextData {
  company_size?: string;
  agents_in_prod?: string;
  deployment_stage?: string;
}

// ─── Bands ────────────────────────────────────────────────────────────────────

const BAND_THRESHOLDS = {
  Exposed: [0, 25],
  Reactive: [26, 50],
  Managed: [51, 75],
  Resilient: [76, 100],
} as const;

export function getBand(score: number): Band {
  if (score <= 25) return 'Exposed';
  if (score <= 50) return 'Reactive';
  if (score <= 75) return 'Managed';
  return 'Resilient';
}

export const BAND_COLORS: Record<Band, string> = {
  Exposed: '#ef4444',
  Reactive: '#f97316',
  Managed: '#eab308',
  Resilient: '#22c55e',
};

export const BAND_DESCRIPTIONS: Record<Band, string> = {
  Exposed:
    'Agents in production with little to no agent-specific security. Operating on hope. High likelihood of an undetected incident.',
  Reactive:
    "Some controls exist ad hoc. You'd detect a loud failure but not a quiet compromise. Most teams shipping agents land here.",
  Managed:
    'Defined, documented controls across most domains. You can answer "where are we weak" with evidence.',
  Resilient:
    'Enforced least agency, full auditability, tested containment. Agents treated as production infrastructure.',
};

// ─── Benchmark (Defect 4) ─────────────────────────────────────────────────────

export const USE_REAL_BENCHMARK = false;

// When USE_REAL_BENCHMARK is true and >= 100 submissions exist, replace the
// static string with a real percentile line:
//   `You scored higher than ${pct}% of ${n} teams.`
export function getBenchmarkLine(band: Band, _globalScore: number): string {
  if (USE_REAL_BENCHMARK) {
    // TODO: fetch real percentile from submission store
    return '';
  }
  return BENCHMARK_LINES[band];
}

const BENCHMARK_LINES: Record<Band, string> = {
  Exposed:
    "Most teams just starting with agents land in Reactive. You're below that — the gaps below are the fastest way up.",
  Reactive:
    'Most teams deploying agents today land here, in Reactive. The difference between Reactive and Managed is usually identity and containment — see below.',
  Managed:
    "You're ahead of most teams deploying agents, who land in Reactive. The remaining gaps are what separate Managed from Resilient.",
  Resilient:
    "You're in the top tier. Most teams deploying agents land in Reactive. Treat the breakdown below as a maintenance checklist.",
};

// ─── Archetype (Defect 1) ─────────────────────────────────────────────────────

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  'The Lopsided Fortress':
    "You've hardened the sophisticated risks while leaving a basic one wide open. Your weakest domain undoes the work in your strongest.",
  'Flying Blind':
    'Agents are in production with little agent-specific security. This is the highest-urgency band — start with identity and containment.',
  'The Blind Operator':
    "You have controls, but little visibility into what agents do and no fast way to stop them. You'd miss a quiet compromise.",
  'The Optimistic Adopter':
    'Moving fast on capability, light on the brakes. Your cognition defenses are ahead of your identity and containment controls.',
  'The Locked-Down Skeptic':
    'Strong governance and identity foundations, with room to extend the same rigor to execution and detection.',
  'The Resilient Operator':
    'Enforced least agency, real auditability, tested containment. Agents are treated as production infrastructure.',
  'The Methodical Builder':
    'Controls are developing evenly across domains. No single catastrophic gap, but no domain is fully managed yet.',
};

function computeArchetype(results: DomainResult[]): Archetype {
  const s: Record<string, number> = {};
  results.forEach((r) => { s[r.domain_id] = r.normalized; });

  const A = s['A'] ?? 0;
  const B = s['B'] ?? 0;
  const C = s['C'] ?? 0;
  const D = s['D'] ?? 0;
  const E = s['E'] ?? 0;

  const vals = [A, B, C, D, E];
  const globalScore = vals.reduce((a, b) => a + b, 0) / 5;
  const maxGap = Math.max(...vals) - Math.min(...vals);
  const minDomain = Math.min(...vals);

  // Rule 1 — Lopsided/dangerous shape: check BEFORE any balanced label
  if (maxGap >= 35 && minDomain < 40) return 'The Lopsided Fortress';

  // Rule 2 — Exposed everywhere
  if (globalScore < 30) return 'Flying Blind';

  // Rule 3 — Controls exist but can't see/stop agents
  if (E < 40 && globalScore >= 40) return 'The Blind Operator';

  // Rule 4 — Shipping fast, weak identity/containment
  if ((B < 50 || E < 50) && C >= 60) return 'The Optimistic Adopter';

  // Rule 5 — Strong governance/identity, weak elsewhere
  if (A >= 60 && B >= 60 && globalScore < 65) return 'The Locked-Down Skeptic';

  // Rule 6 — Genuinely strong and even
  if (globalScore >= 75 && maxGap < 35) return 'The Resilient Operator';

  // Rule 7 — Default: even, mid maturity
  return 'The Methodical Builder';
}

// ─── Severity ranking (Defect 2) ─────────────────────────────────────────────
// 1 = most urgent to fix when scored low. No duplicates. 1–20.

export const SEVERITY_RANK: Record<string, number> = {
  E3: 1,  // No kill-switch / containment path
  B1: 2,  // Shared agent identity
  B4: 3,  // On-behalf-of confusion
  E4: 4,  // Humans rubber-stamp approvals
  D2: 5,  // Unvetted third-party tools / MCP
  C1: 6,  // External content can issue instructions
  D1: 7,  // Unsandboxed code execution
  A1: 8,  // No agent inventory
  C3: 9,  // Memory poisoning unprotected
  B2: 10, // No least-agency scoping
  B3: 11, // Long-lived / no JIT credentials
  E2: 12, // No behavioral anomaly monitoring
  E1: 13, // No action-level audit trail
  D3: 14, // Inter-agent communication unauthenticated
  D4: 15, // Dangerous capabilities not allow-listed
  C2: 16, // High-impact actions not gated
  C4: 17, // No adversarial / prompt-injection testing
  A2: 18, // No named security owner
  A3: 19, // No pre-prod approval gate
  A4: 20, // No documented risk posture
};

function questionRiskScore(questionId: string, value: AnswerValue): number {
  const gap = value === 'na' ? 3 : 3 - (value as number);
  const rank = SEVERITY_RANK[questionId] ?? 20;
  return gap * (21 - rank);
}

// ─── Top-3 with domain diversity (Defect 2) ───────────────────────────────────

function computeTop3(answers: Answers): TopRisk[] {
  const scored = QUESTIONS.map((q) => {
    const value = answers[q.id] ?? (0 as AnswerValue);
    return { question: q, value, riskScore: questionRiskScore(q.id, value) };
  })
    .filter((x) => x.riskScore > 0)
    .sort((a, b) =>
      b.riskScore !== a.riskScore
        ? b.riskScore - a.riskScore
        : (SEVERITY_RANK[a.question.id] ?? 20) - (SEVERITY_RANK[b.question.id] ?? 20)
    );

  const picks: typeof scored = [];

  // #1 — highest risk score
  if (scored.length > 0) picks.push(scored[0]);

  // #2 — highest from a different domain
  if (picks.length >= 1) {
    const used = new Set(picks.map((p) => p.question.domain_id));
    const second = scored.find((s) => !used.has(s.question.domain_id))
      ?? scored.find((s) => !picks.includes(s));
    if (second) picks.push(second);
  }

  // #3 — highest from a new domain, unless a higher riskScore beats it by >= 15
  if (picks.length >= 2) {
    const used = new Set(picks.map((p) => p.question.domain_id));
    const remaining = scored.filter((s) => !picks.includes(s));
    const bestNew = remaining.find((s) => !used.has(s.question.domain_id));
    const bestAny = remaining[0];

    if (!bestNew) {
      if (bestAny) picks.push(bestAny);
    } else if (!bestAny || bestNew === bestAny) {
      picks.push(bestNew);
    } else {
      // Take the higher-riskScore item if it beats bestNew by >= 15 points
      picks.push(bestAny.riskScore - bestNew.riskScore >= 15 ? bestAny : bestNew);
    }
  }

  return picks.map(({ question, value }) => {
    const domain = DOMAINS.find((d) => d.id === question.domain_id)!;
    return { question, value, domain_name: domain.name, domain_color: domain.color };
  });
}

// ─── Roadmap actions (Defect 6) ───────────────────────────────────────────────
// Compressed imperative sentence per question, derived from first_action copy.

const ROADMAP_ACTIONS: Record<string, string> = {
  E3: "Stand up a kill-switch: one command that revokes a misbehaving agent's access",
  B1: 'Give your highest-privilege agent its own scoped identity; rotate the shared credential',
  B4: 'Propagate user identity through on-behalf-of calls; verify with a low-privilege test user',
  E4: 'Require independent human verification on high-stakes agent approvals',
  D2: 'Vet and pin every third-party tool and MCP server; freeze any that auto-update from a registry',
  C1: 'Enforce an instruction/data boundary: test each external content source for prompt-injection',
  D1: 'Sandbox agent code execution: no host mounts, restricted network, non-root user',
  A1: 'Build a live inventory of every prod agent, its scopes, and its owner',
  C3: 'Audit what can write to agent memory; block untrusted content from persisting across sessions',
  B2: 'List every tool one agent can access; remove anything unused in the past 30 days',
  B3: 'Set a 90-day rotation schedule for all agent credentials as a floor toward JIT',
  E2: 'Define baseline behavior for one agent and set alerts when it deviates 2× from normal',
  E1: 'Enable action-level logging with enough context to replay a decision chain',
  D3: 'Add mutual authentication to each agent-to-agent and agent-to-tool communication path',
  D4: 'Build an explicit capability allow-list per agent; block everything not on it',
  C2: 'Define your top-5 high-impact actions and add a mandatory confirmation step to each',
  C4: 'Run Promptfoo or Garak against one production agent this week',
  A2: 'Name a single accountable owner for AI agent security with explicit mandate',
  A3: 'Create a one-page new-agent checklist and require it for the next deployment',
  A4: "Write one paragraph defining what your agents are allowed and not allowed to do",
};

function computeRoadmap(answers: Answers): RoadmapItem[] {
  return QUESTIONS.map((q) => {
    const value = answers[q.id] ?? (0 as AnswerValue);
    const score = value === 'na' ? 0 : (value as number);
    return { question: q, value, score, riskScore: questionRiskScore(q.id, value) };
  })
    .filter(({ score }) => score <= 1)               // gap >= 2
    .sort((a, b) =>
      b.riskScore !== a.riskScore
        ? b.riskScore - a.riskScore
        : (SEVERITY_RANK[a.question.id] ?? 20) - (SEVERITY_RANK[b.question.id] ?? 20)
    )
    .slice(0, 7)
    .map(({ question, riskScore }) => ({
      question,
      action: ROADMAP_ACTIONS[question.id] ?? question.first_action,
      asi_tag: `${question.asi_ref}/${question.domain_id}`,
      riskScore,
    }));
}

// ─── CTA helpers (Defect 5) ───────────────────────────────────────────────────

export const CTA_BOOKING_URL = 'https://molntek.com/services/ai-security-assessment';
export const CTA_NEWSLETTER_URL = 'https://molntek.beehiiv.com/subscribe';

// Returns a human-readable phrase for the weak domains in the top-3 risks
export function getTop3DomainTheme(top3: TopRisk[]): string {
  const names: Record<string, string> = {
    A: 'governance',
    B: 'identity',
    C: 'cognition',
    D: 'supply chain',
    E: 'containment',
  };
  const unique = [...new Set(top3.map((r) => r.question.domain_id))];
  const labels = unique.map((id) => names[id] ?? id);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function scoreAnswerValue(value: AnswerValue): number {
  if (value === 'na') return 0;
  return value;
}

export function computeResult(answers: Answers): AssessmentResult {
  const domain_results: DomainResult[] = DOMAINS.map((domain) => {
    const domainQuestions = QUESTIONS.filter((q) => q.domain_id === domain.id);
    const scores = domainQuestions.map((q) => scoreAnswerValue(answers[q.id] ?? 0));
    const raw_mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const normalized = Math.round((raw_mean / 3) * 100);
    return {
      domain_id: domain.id,
      domain_name: domain.name,
      raw_mean,
      normalized,
      band: getBand(normalized),
    };
  });

  const global_score = Math.round(
    domain_results.reduce((a, b) => a + b.normalized, 0) / domain_results.length
  );
  const global_band = getBand(global_score);
  const archetype = computeArchetype(domain_results);

  return {
    global_score,
    global_band,
    archetype,
    archetype_subtitle: ARCHETYPE_DESCRIPTIONS[archetype],
    benchmark_line: getBenchmarkLine(global_band, global_score),
    domain_results,
    top3_risks: computeTop3(answers),
    roadmap_items: computeRoadmap(answers),
    radar_data: domain_results.map((d) => d.normalized),
  };
}

// ─── URL encoding ─────────────────────────────────────────────────────────────

export function encodeAnswers(answers: Answers): string {
  const entries = Object.entries(answers)
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  return btoa(entries);
}

export function decodeAnswers(encoded: string): Answers {
  try {
    const decoded = atob(encoded);
    const answers: Answers = {};
    decoded.split(',').forEach((entry) => {
      const [key, val] = entry.split(':');
      if (key && val !== undefined) {
        answers[key] = (val === 'na' ? 'na' : parseInt(val, 10)) as AnswerValue;
      }
    });
    return answers;
  } catch {
    return {};
  }
}

export { BAND_THRESHOLDS };
