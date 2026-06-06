import { useState } from 'react';
import { DOMAINS, QUESTIONS } from '../../data/questions';
import type { Answers } from '../../data/scoring';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import styles from './AssessmentScreen.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  initialAnswers: Answers;
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}

export function AssessmentScreen({ initialAnswers, onComplete, onBack }: Props) {
  const [domainIdx, setDomainIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  const domain = DOMAINS[domainIdx];
  const domainQuestions = QUESTIONS.filter((q) => q.domain_id === domain.id);

  const totalAnswered = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const domainAnswered = domainQuestions.filter((q) => answers[q.id] !== undefined).length;
  const allDomainAnswered = domainAnswered === domainQuestions.length;
  const isLast = domainIdx === DOMAINS.length - 1;

  function setAnswer(questionId: string, value: 0 | 1 | 2 | 3 | 'na') {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (isLast) {
      onComplete(answers);
    } else {
      setDomainIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (domainIdx === 0) {
      onBack();
    } else {
      setDomainIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className={styles.root}>
      <ProgressBar
        current={totalAnswered}
        total={QUESTIONS.length}
        domainIdx={domainIdx}
        domains={DOMAINS}
      />

      <div className={styles.container}>
        <div className={styles.domainHeader}>
          <div
            className={styles.domainTag}
            style={{ background: domain.color + '22', color: domain.color, borderColor: domain.color + '44' }}
          >
            Domain {domain.id} of {DOMAINS.length}
          </div>
          <h1 className={styles.domainTitle}>{domain.name}</h1>
          <p className={styles.domainIntro}>{domain.intro_copy}</p>
          <div className={styles.asiRefs}>
            {domain.asi_refs.map((ref) => (
              <span key={ref} className={styles.asiRef}>{ref}</span>
            ))}
          </div>
        </div>

        <div className={styles.questions}>
          {domainQuestions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i + 1}
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              domainColor={domain.color}
            />
          ))}
        </div>

        <div className={styles.navigation}>
          <button className={styles.navBack} onClick={handlePrev}>
            <ChevronLeft size={16} />
            {domainIdx === 0 ? 'Back' : 'Previous domain'}
          </button>

          <div className={styles.navCenter}>
            <span className={styles.navProgress}>
              {domainAnswered}/{domainQuestions.length} answered
            </span>
          </div>

          <button
            className={`${styles.navNext} ${!allDomainAnswered ? styles.navNextDisabled : ''}`}
            onClick={handleNext}
            disabled={!allDomainAnswered}
            title={!allDomainAnswered ? 'Answer all questions to continue' : ''}
          >
            {isLast ? 'See my results' : 'Next domain'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
