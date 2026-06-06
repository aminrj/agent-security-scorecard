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
  | 'Optimistic Adopter'
  | 'Locked-Down Skeptic'
  | 'Blind Operator'
  | 'Lab Tinkerer'
  | 'Cautious Builder';

export interface TopRisk {
  question: Question;
  value: AnswerValue;
  domain_name: string;
  domain_color: string;
}

export interface AssessmentResult {
  global_score: number;
  global_band: Band;
  archetype: Archetype;
  archetype_subtitle: string;
  domain_results: DomainResult[];
  top3_risks: TopRisk[];
  radar_data: number[];
}

export interface ContextData {
  company_size?: string;
  agents_in_prod?: string;
  deployment_stage?: string;
}

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

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  'Optimistic Adopter': 'Moving fast with low brakes. Shipping agents quickly but under-investing in identity and detection controls.',
  'Locked-Down Skeptic': 'Strong governance and identity controls. Cautious deployment — security is ahead of the agent rollout.',
  'Blind Operator': 'Decent controls in place, but flying blind. Near-zero visibility into what agents are actually doing.',
  'Lab Tinkerer': 'Strong technical depth in cognition and testing. Governance and inventory are still catching up.',
  'Cautious Builder': 'Balanced posture — methodically building controls alongside deployment. Well-positioned for scale.',
};

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

  // Top-3 risks: lowest scoring questions (excluding na answers from sorting)
  const ASI_SEVERITY_RANK: Record<string, number> = {
    ASI01: 1, ASI06: 2, ASI03: 3, ASI02: 4, ASI10: 5,
    ASI08: 6, ASI09: 7, ASI04: 8, ASI05: 9, ASI07: 10,
  };

  const answeredQuestions = QUESTIONS.map((q) => ({
    question: q,
    value: answers[q.id] ?? 0,
  }));

  const top3_risks: TopRisk[] = answeredQuestions
    .filter(({ value }) => value !== 3)
    .sort((a, b) => {
      const aScore = a.value === 'na' ? 0 : a.value;
      const bScore = b.value === 'na' ? 0 : b.value;
      if (aScore !== bScore) return aScore - bScore;
      return (ASI_SEVERITY_RANK[a.question.asi_ref] ?? 99) - (ASI_SEVERITY_RANK[b.question.asi_ref] ?? 99);
    })
    .slice(0, 3)
    .map(({ question, value }) => {
      const domain = DOMAINS.find((d) => d.id === question.domain_id)!;
      return { question, value, domain_name: domain.name, domain_color: domain.color };
    });

  const radar_data = domain_results.map((d) => d.normalized);
  const archetype = computeArchetype(domain_results);

  return {
    global_score,
    global_band,
    archetype,
    archetype_subtitle: ARCHETYPE_DESCRIPTIONS[archetype],
    domain_results,
    top3_risks,
    radar_data,
  };
}

function computeArchetype(results: DomainResult[]): Archetype {
  const scores: Record<string, number> = {};
  results.forEach((r) => { scores[r.domain_id] = r.normalized; });

  const governance = scores['A'] ?? 0;
  const identity = scores['B'] ?? 0;
  const cognition = scores['C'] ?? 0;
  const supplyChain = scores['D'] ?? 0;
  const detection = scores['E'] ?? 0;

  const avg = (governance + identity + cognition + supplyChain + detection) / 5;

  if (identity < 40 && detection < 40 && avg > 25) {
    return 'Optimistic Adopter';
  }
  if (governance >= 50 && identity >= 50 && avg < 55) {
    return 'Locked-Down Skeptic';
  }
  if (detection < 30 && avg >= 35) {
    return 'Blind Operator';
  }
  if (cognition >= 50 && governance < 40) {
    return 'Lab Tinkerer';
  }
  return 'Cautious Builder';
}

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
