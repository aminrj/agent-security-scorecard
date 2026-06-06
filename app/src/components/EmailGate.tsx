import { useState } from 'react';
import type { AssessmentResult, Answers } from '../data/scoring';
import { generatePDF } from '../utils/pdfGenerator';
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

    try {
      await subscribeToBeehiiv(email);
    } catch {
      // Non-fatal — still generate the PDF
    }

    try {
      await generatePDF(result, answers, email);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }

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
            ASI-mapped remediation roadmap. Plus the{' '}
            <strong>AI Security Intelligence</strong> newsletter — unsubscribe
            anytime.
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
                onChange={(e) => setEmail(e.target.value)}
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
            No spam. Unsubscribe anytime. Your assessment data never leaves your browser.
          </p>
        </form>
      </div>
    </div>
  );
}

async function subscribeToBeehiiv(email: string): Promise<void> {
  // Replace VITE_BEEHIIV_PUBLICATION_ID with your actual publication ID
  // and ensure the Beehiiv API key is set via a serverless function or proxy
  // for production use. For this MVP, we use the public subscribe form endpoint.
  const publicationId = import.meta.env.VITE_BEEHIIV_PUBLICATION_ID;
  if (!publicationId) return;

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: For production, proxy through a serverless function to keep
        // the API key off the client. This is a lead magnet MVP.
        Authorization: `Bearer ${import.meta.env.VITE_BEEHIIV_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'agent-security-scorecard',
        utm_medium: 'assessment',
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Beehiiv subscription failed: ${res.status}`);
  }
}
