import type { DomainResult } from '../../data/scoring';
import { BAND_COLORS } from '../../data/scoring';
import { DOMAINS } from '../../data/questions';
import styles from './DomainBreakdown.module.css';

interface Props {
  domainResults: DomainResult[];
}

const WHAT_GOOD_LOOKS_LIKE: Record<string, string> = {
  A: 'A live automated inventory with per-agent scope tracking, a named security owner with mandate, enforced pre-prod approval gate, and a documented risk posture that drives technical controls.',
  B: 'Every agent has a managed identity. Permissions are task-scoped to the minimum needed. Credentials are JIT or rotate on schedule. User identity propagates through every authorization decision.',
  C: 'External content is architecturally separated from instructions. High-impact actions require re-validated intent. Memory integrity is verified per session. Prompt-injection testing runs in CI.',
  D: 'Code execution is sandboxed. Third-party tools are vetted and pinned. Inter-agent comms are mutually authenticated. Dangerous capabilities are on an explicit per-agent allow-list.',
  E: 'Full action-level audit trails are replayable. Behavioral anomaly alerts fire within minutes. Kill-switch is tested in regular drills. High-stakes human approvals require independent verification.',
};

export function DomainBreakdown({ domainResults }: Props) {
  return (
    <div className={styles.grid}>
      {domainResults.map((dr) => {
        const domain = DOMAINS.find((d) => d.id === dr.domain_id)!;
        const bandColor = BAND_COLORS[dr.band];

        return (
          <div key={dr.domain_id} className={styles.card}>
            <div className={styles.header}>
              <div className={styles.domainInfo}>
                <span className={styles.domainId} style={{ color: domain.color }}>
                  {dr.domain_id}
                </span>
                <span className={styles.domainName}>{domain.shortName}</span>
              </div>
              <div className={styles.scoreArea}>
                <span className={styles.score} style={{ color: bandColor }}>
                  {dr.normalized}
                </span>
                <span className={styles.scoreOf}>/100</span>
              </div>
            </div>

            <div className={styles.barRow}>
              <div className={styles.barBg}>
                <div
                  className={styles.barFill}
                  style={{ width: `${dr.normalized}%`, background: bandColor }}
                />
                <div
                  className={styles.barTarget}
                  style={{ left: '76%' }}
                />
              </div>
              <span
                className={styles.bandLabel}
                style={{ color: bandColor, background: bandColor + '18', borderColor: bandColor + '44' }}
              >
                {dr.band}
              </span>
            </div>

            <p className={styles.goodLooks}>
              <span className={styles.goodLabel}>What good looks like: </span>
              {WHAT_GOOD_LOOKS_LIKE[dr.domain_id]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
