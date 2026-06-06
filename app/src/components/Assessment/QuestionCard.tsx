import type { Question } from '../../data/questions';
import type { AnswerValue } from '../../data/scoring';
import styles from './QuestionCard.module.css';

interface Props {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  domainColor: string;
}

const SCALE_SCORES: AnswerValue[] = [0, 1, 2, 3];

export function QuestionCard({ question, index, value, onChange, domainColor }: Props) {
  return (
    <div className={`${styles.card} ${value !== undefined ? styles.answered : ''}`}>
      <div className={styles.header}>
        <span className={styles.qNum} style={{ color: domainColor }}>Q{index}</span>
        <span className={styles.asiRef}>{question.asi_ref}</span>
      </div>
      <p className={styles.questionText}>{question.text}</p>

      <div className={styles.options}>
        {SCALE_SCORES.map((score) => (
          <button
            key={score}
            className={`${styles.option} ${value === score ? styles.optionSelected : ''}`}
            onClick={() => onChange(score)}
            style={value === score ? { borderColor: domainColor, background: domainColor + '18' } : {}}
          >
            <div className={styles.optionScore} style={value === score ? { background: domainColor, color: 'white' } : {}}>
              {score}
            </div>
            <span className={styles.optionLabel}>{question.scale_labels[score as number]}</span>
          </button>
        ))}

        <button
          className={`${styles.option} ${styles.optionNa} ${value === 'na' ? styles.optionNaSelected : ''}`}
          onClick={() => onChange('na')}
        >
          <div className={styles.optionScore} style={value === 'na' ? { background: '#4f5769', color: 'white' } : {}}>
            N/A
          </div>
          <span className={styles.optionLabel}>{question.na_label}</span>
        </button>
      </div>
    </div>
  );
}
