import { useEffect } from 'react';
import type { Answers } from '../data/scoring';
import styles from './ComputingScreen.module.css';

interface Props {
  answers: Answers;
  onDone: () => void;
}

const MESSAGES = [
  'Analyzing your governance posture…',
  'Scoring identity and access controls…',
  'Evaluating input trust boundaries…',
  'Checking supply chain exposure…',
  'Assessing detection and response…',
  'Computing your archetype…',
  'Mapping to OWASP ASI 2026…',
  'Generating your remediation priorities…',
];

export function ComputingScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing} />
          <div className={styles.spinnerRing2} />
          <div className={styles.spinnerDot} />
        </div>
        <h2 className={styles.title}>Scoring your posture</h2>
        <div className={styles.messages}>
          {MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={styles.message}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <div className={styles.messageDot} style={{ animationDelay: `${i * 0.3 + 0.1}s` }} />
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
