import { Shield, Clock, ChevronRight, Star } from 'lucide-react';
import styles from './Landing.module.css';

interface Props {
  onStart: () => void;
}

export function Landing({ onStart }: Props) {
  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Shield size={20} color="#6366f1" />
          <span>Agent Security Scorecard</span>
        </div>
        <div className={styles.navBadge}>
          <span>Built on OWASP Agentic Top 10 2026</span>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowBadge}>Free · No signup · Instant results</span>
        </div>

        <h1 className={styles.headline}>
          Are Your AI Agents<br />
          <span className={styles.headlineAccent}>Locked Down?</span>
        </h1>

        <p className={styles.subhead}>
          The only vendor-neutral, agent-native self-diagnostic that scores you
          against the <strong>OWASP Agentic Top 10 2026</strong> in 12 minutes
          and tells you which three risks to fix first.
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>20</span>
            <span className={styles.statLabel}>scored questions</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>5</span>
            <span className={styles.statLabel}>security domains</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>12 min</span>
            <span className={styles.statLabel}>to complete</span>
          </div>
        </div>

        <button className={styles.ctaButton} onClick={onStart}>
          Start your assessment
          <ChevronRight size={18} />
        </button>

        <div className={styles.ctaMeta}>
          <Clock size={13} color="#4f5769" />
          <span>~12 minutes · No login required · Results stay in your browser</span>
        </div>
      </main>

      <section className={styles.domains}>
        <h2 className={styles.domainsTitle}>Five domains. Every agentic risk vector.</h2>
        <div className={styles.domainGrid}>
          {DOMAIN_PREVIEWS.map((d) => (
            <div key={d.id} className={styles.domainCard}>
              <div className={styles.domainIcon} style={{ background: d.color + '22', color: d.color }}>
                {d.icon}
              </div>
              <div>
                <div className={styles.domainCardTitle}>{d.name}</div>
                <div className={styles.domainCardSub}>{d.asi}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.painPoints}>
        <div className={styles.painGrid}>
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className={styles.painCard}>
              <div className={styles.painQuote}>"{p.pain}"</div>
              <div className={styles.painAnswer}>{p.answer}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.outputPreview}>
        <h2 className={styles.domainsTitle}>What you get</h2>
        <div className={styles.outputGrid}>
          {OUTPUT_ITEMS.map((item, i) => (
            <div key={i} className={styles.outputItem}>
              <div className={styles.outputIcon}>{item.icon}</div>
              <div>
                <div className={styles.outputTitle}>{item.title}</div>
                <div className={styles.outputDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta2}>
        <h2>Score your agents. Know your gaps.</h2>
        <p>OWASP tells you the ten risks. This tells you which three are bleeding in your stack.</p>
        <button className={styles.ctaButton} onClick={onStart}>
          Start the 12-minute assessment
          <ChevronRight size={18} />
        </button>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <Shield size={16} color="#6366f1" />
            <span>Agent Security Scorecard</span>
          </div>
          <div className={styles.footerRight}>
            <span>Grounded in OWASP Top 10 for Agentic Applications 2026</span>
            <span className={styles.footerDot}>·</span>
            <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer">
              OWASP Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DOMAIN_PREVIEWS = [
  { id: 'A', name: 'Agent Inventory & Governance', asi: 'ASI10 · Rogue Agents', color: '#6366f1', icon: '📋' },
  { id: 'B', name: 'Identity, Access & Least Agency', asi: 'ASI02, ASI03 · Privilege Abuse', color: '#8b5cf6', icon: '🔑' },
  { id: 'C', name: 'Input Trust & Cognition', asi: 'ASI01, ASI06 · Goal Hijack', color: '#ec4899', icon: '🧠' },
  { id: 'D', name: 'Execution & Supply Chain', asi: 'ASI04, ASI05, ASI07', color: '#f59e0b', icon: '⚙️' },
  { id: 'E', name: 'Detection, Response & Containment', asi: 'ASI08, ASI09, ASI10', color: '#10b981', icon: '🔍' },
];

const PAIN_POINTS = [
  {
    pain: 'I have no inventory of what agents exist or what they can touch.',
    answer: 'Domain A scores your agent inventory and governance posture — including the ownership vacuum.',
  },
  {
    pain: "Agent permissions are way too broad and least-privilege fights autonomy.",
    answer: 'Domain B measures how far you are from "least agency" — the 2026 answer to the permission paradox.',
  },
  {
    pain: 'Prompt injection is treated as an afterthought.',
    answer: 'Domain C tests whether external content can issue instructions to your agents.',
  },
  {
    pain: 'We have zero visibility into what agents actually did.',
    answer: 'Domain E scores your action-level audit trail, anomaly detection, and kill-switch readiness.',
  },
];

const OUTPUT_ITEMS = [
  {
    icon: <Star size={18} />,
    title: 'Named archetype',
    desc: 'Optimistic Adopter, Blind Operator, Lab Tinkerer — a shareable identity, not just a percentage.',
  },
  {
    icon: '🕸',
    title: 'Radar chart',
    desc: 'All 5 domains plotted against the Resilient target — the gap is the story.',
  },
  {
    icon: '🎯',
    title: 'Top-3 prioritized risks',
    desc: 'Each mapped to an ASI item with a concrete first action and a verification check.',
  },
  {
    icon: '📄',
    title: 'Full remediation report',
    desc: 'Email-gated PDF with all 20 answers and an ASI-mapped remediation roadmap.',
  },
];
