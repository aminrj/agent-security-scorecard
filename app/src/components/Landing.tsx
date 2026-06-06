import { Shield, Clock, ChevronRight, FileText, Target, BarChart2, Award } from 'lucide-react';
import styles from './Landing.module.css';

interface Props {
  onStart: () => void;
}

export function Landing({ onStart }: Props) {
  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Shield size={16} color="#6366f1" strokeWidth={2} />
          <span>Agent Security Scorecard</span>
        </div>
        <div className={styles.navBadge}>OWASP Agentic Top 10 2026</div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.eyebrow}>Free · No signup · Instant results</div>

        <h1 className={styles.headline}>
          Are your AI agents<br />
          <span className={styles.headlineAccent}>locked down?</span>
        </h1>

        <p className={styles.subhead}>
          Score your agents against the <strong>OWASP Agentic Top 10 2026</strong> in 12 minutes.
          Identify your three biggest risks. Get a prioritized remediation roadmap.
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>20</span>
            <span className={styles.statLabel}>questions</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>5</span>
            <span className={styles.statLabel}>domains</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>12 min</span>
            <span className={styles.statLabel}>to complete</span>
          </div>
        </div>

        <button className={styles.ctaButton} onClick={onStart}>
          Start your assessment
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>

        <p className={styles.ctaMeta}>
          <Clock size={12} color="#4f5769" />
          No login required · Results stay in your browser
        </p>
      </main>

      <section className={styles.domains}>
        <h2 className={styles.sectionTitle}>Five domains. Every agentic risk vector.</h2>
        <div className={styles.domainGrid}>
          {DOMAIN_PREVIEWS.map((d) => (
            <div key={d.id} className={styles.domainCard}>
              <div className={styles.domainLetter} style={{ color: d.color, borderColor: d.color + '44', background: d.color + '14' }}>
                {d.id}
              </div>
              <div>
                <div className={styles.domainCardTitle}>{d.name}</div>
                <div className={styles.domainCardSub}>{d.asi}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.outputs}>
        <h2 className={styles.sectionTitle}>What you get</h2>
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

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <Shield size={14} color="#4f5769" />
            <span>Agent Security Scorecard</span>
          </div>
          <div className={styles.footerRight}>
            <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer">
              OWASP Top 10 for Agentic Applications 2026
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DOMAIN_PREVIEWS = [
  { id: 'A', name: 'Agent Inventory & Governance',      asi: 'ASI10 — Rogue Agents',             color: '#6366f1' },
  { id: 'B', name: 'Identity, Access & Least Agency',   asi: 'ASI02, ASI03 — Privilege Abuse',   color: '#8b5cf6' },
  { id: 'C', name: 'Input Trust & Cognition',           asi: 'ASI01, ASI06 — Goal Hijack',       color: '#ec4899' },
  { id: 'D', name: 'Execution & Supply Chain',          asi: 'ASI04, ASI05, ASI07',              color: '#f59e0b' },
  { id: 'E', name: 'Detection, Response & Containment', asi: 'ASI08, ASI09, ASI10',              color: '#10b981' },
];

const OUTPUT_ITEMS = [
  {
    icon: <Award size={17} strokeWidth={1.8} />,
    title: 'Named archetype',
    desc: 'Optimistic Adopter, Blind Operator, Cautious Builder — a shareable posture identity.',
  },
  {
    icon: <BarChart2 size={17} strokeWidth={1.8} />,
    title: 'Radar chart',
    desc: 'All 5 domains plotted against the Resilient target. The gap is the story.',
  },
  {
    icon: <Target size={17} strokeWidth={1.8} />,
    title: 'Top-3 prioritized risks',
    desc: 'Each mapped to an ASI item with a concrete first action and a verification check.',
  },
  {
    icon: <FileText size={17} strokeWidth={1.8} />,
    title: 'Remediation PDF',
    desc: 'All 20 answers with an ASI-mapped remediation roadmap, downloads to your device.',
  },
];
