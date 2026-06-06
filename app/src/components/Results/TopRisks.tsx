import type { TopRisk } from '../../data/scoring';
import { ASI_DESCRIPTIONS } from '../../data/questions';
import { AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import styles from './TopRisks.module.css';

interface Props {
  risks: TopRisk[];
}

export function TopRisks({ risks }: Props) {
  if (risks.length === 0) {
    return (
      <div className={styles.empty}>
        Your score is very strong across all questions — keep maintaining these controls.
      </div>
    );
  }

  return (
    <div className={styles.risks}>
      {risks.map((risk, i) => (
        <RiskCard key={risk.question.id} risk={risk} rank={i + 1} />
      ))}
    </div>
  );
}

function RiskCard({ risk, rank }: { risk: TopRisk; rank: number }) {
  const score = risk.value === 'na' ? 0 : risk.value;
  const scoreLabel = risk.value === 'na' ? 'Not yet deployed' : `Level ${score}/3`;
  const asiName = ASI_DESCRIPTIONS[risk.question.asi_ref] ?? risk.question.asi_ref;

  return (
    <div className={styles.card} style={{ borderLeftColor: risk.domain_color }}>
      <div className={styles.header}>
        <div className={styles.rank} style={{ color: risk.domain_color, borderColor: risk.domain_color + '44', background: risk.domain_color + '18' }}>
          #{rank}
        </div>
        <div className={styles.meta}>
          <span className={styles.asiTag}>{risk.question.asi_ref}</span>
          <span className={styles.asiName}>{asiName}</span>
        </div>
        <div className={styles.score} style={{ color: score === 0 ? '#ef4444' : score === 1 ? '#f97316' : '#eab308' }}>
          {scoreLabel}
        </div>
      </div>

      <p className={styles.questionText}>{risk.question.text}</p>

      <div className={styles.details}>
        <div className={styles.detail}>
          <div className={styles.detailIcon}>
            <AlertTriangle size={13} />
            Why it matters
          </div>
          <p className={styles.detailText}>{risk.question.why_it_matters}</p>
        </div>
        <div className={styles.detail}>
          <div className={styles.detailIcon} style={{ color: '#6366f1' }}>
            <Zap size={13} />
            First action this week
          </div>
          <p className={styles.detailText}>{risk.question.first_action}</p>
        </div>
        <div className={styles.detail}>
          <div className={styles.detailIcon} style={{ color: '#22c55e' }}>
            <CheckCircle size={13} />
            How to verify you fixed it
          </div>
          <p className={styles.detailText}>{risk.question.how_to_verify}</p>
        </div>
      </div>
    </div>
  );
}
