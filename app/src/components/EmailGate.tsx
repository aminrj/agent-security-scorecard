import { useState } from 'react';
import type { AssessmentResult, Answers } from '../data/scoring';
import { generatePDF } from '../utils/pdfGenerator';
import { getUtmParams } from '../utils/utm';
import { track } from '../utils/analytics';
import { Mail, Download, Loader } from 'lucide-react';
import styles from './EmailGate.module.css';

interface Props {
  result: AssessmentResult;
  answers: Answers;
  onSubmitted: () => void;
}

type State = 'idle' | 'submitting' | 'done' | 'error';

export function EmailGate({ result, answers, onSubmitted }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setState('submitting');
    setErrorMsg('');

    // Generate PDF first — browsers are more permissive with downloads
    // when triggered close to the user gesture
    try {
      await generatePDF(result, answers, email);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setState('error');
      setErrorMsg('PDF generation failed. Please try again or refresh the page.');
      return;
    }

    // Subscribe in background — non-fatal if it fails
    subscribeToBeehiiv(email)
      .then(() => track('Email Submitted', { band: result.global_band, score: result.global_score }))
      .catch(() => {});

    setState('done');
    onSubmitted();
  }

  if (state === 'done') {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.icon}>
          <Download size={24} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>Get your full remediation report</h3>
          <p className={styles.desc}>
            A branded PDF with your radar, all 20 answers, and a complete
            ASI-mapped remediation roadmap — <strong>downloads instantly to your device</strong>.
            Plus the <strong>AI Security Intelligence</strong> newsletter — unsubscribe anytime.
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                disabled={state === 'submitting'}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.submit}
              disabled={state === 'submitting'}
            >
              {state === 'submitting' ? (
                <>
                  <Loader size={14} className={styles.spinner} />
                  Generating…
                </>
              ) : (
                <>
                  <Download size={14} />
                  Get PDF report
                </>
              )}
            </button>
          </div>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <p className={styles.fine}>
            PDF downloads directly in your browser — no email attachment. Newsletter signup only. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}

async function subscribeToBeehiiv(email: string): Promise<void> {
  const utm = getUtmParams();

  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      utm_source: utm.utm_source ?? 'agent-security-scorecard',
      utm_medium: utm.utm_medium ?? 'assessment',
      utm_campaign: utm.utm_campaign ?? 'organic',
    }),
  });

  if (!res.ok) {
    throw new Error(`Subscribe failed: ${res.status}`);
  }
}
