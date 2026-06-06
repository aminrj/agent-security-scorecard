import type { AssessmentResult } from '../../data/scoring';
import { CTA_BOOKING_URL, CTA_NEWSLETTER_URL, getTop3DomainTheme } from '../../data/scoring';
import styles from './CTABlock.module.css';

interface Props {
  result: AssessmentResult;
}

export function CTABlock({ result }: Props) {
  const isDirect = result.global_band === 'Exposed' || result.global_band === 'Reactive';
  const theme = getTop3DomainTheme(result.top3_risks);

  if (isDirect) {
    return (
      <div className={`${styles.root} ${styles.rootDirect}`}>
        <h3 className={styles.heading}>Want help closing these gaps?</h3>
        <p className={styles.body}>
          A weak <strong>{theme}</strong> posture is the most common pattern we see in teams shipping agents — and the most fixable.
          The <strong>Molntek AI Security Sprint</strong> is a focused engagement that closes exactly the gaps
          in your top three above.
        </p>
        <div className={styles.actions}>
          <a href={CTA_BOOKING_URL} target="_blank" rel="noopener noreferrer" className={styles.primary}>
            Book a 30-min Agent Security review →
          </a>
          <a href={CTA_NEWSLETTER_URL} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
            Not ready? The AI Security Intelligence newsletter covers this every week →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles.rootLight}`}>
      <h3 className={styles.heading}>Keep your edge</h3>
      <p className={styles.body}>
        You're ahead of most teams. The <strong>AI Security Intelligence</strong> newsletter covers agentic
        security developments — OWASP updates, new attack classes, and field patterns — every week.
      </p>
      <div className={styles.actions}>
        <a href={CTA_NEWSLETTER_URL} target="_blank" rel="noopener noreferrer" className={styles.primary}>
          Read the newsletter →
        </a>
        <a href={CTA_BOOKING_URL} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
          Running a complex agent estate? A Molntek Agentic AI Security Review goes deeper →
        </a>
      </div>
    </div>
  );
}
