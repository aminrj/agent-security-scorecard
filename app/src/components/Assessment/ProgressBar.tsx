import type { Domain } from '../../data/questions';
import styles from './ProgressBar.module.css';

interface Props {
  current: number;
  total: number;
  domainIdx: number;
  domains: Domain[];
}

export function ProgressBar({ current, total, domainIdx, domains }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.domainDots}>
          {domains.map((d, i) => (
            <div
              key={d.id}
              className={`${styles.dot} ${i < domainIdx ? styles.dotDone : ''} ${i === domainIdx ? styles.dotActive : ''}`}
              style={i === domainIdx ? { borderColor: d.color, background: d.color + '22' } : {}}
            >
              <span
                className={styles.dotLabel}
                style={i === domainIdx ? { color: d.color } : {}}
              >
                {d.shortName}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.barWrap}>
          <div className={styles.bar}>
            <div
              className={styles.barFill}
              style={{ width: `${pct}%`, background: domains[domainIdx].color }}
            />
          </div>
          <span className={styles.count}>{current}/{total}</span>
        </div>
      </div>
    </div>
  );
}
