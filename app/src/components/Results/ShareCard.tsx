import { useState } from 'react';
import type { AssessmentResult } from '../../data/scoring';
import { BAND_COLORS } from '../../data/scoring';
import { Copy, ExternalLink } from 'lucide-react';
import { track } from '../../utils/analytics';
import styles from './ShareCard.module.css';

interface Props {
  result: AssessmentResult;
  shareUrl: string;
}

export function ShareCard({ result, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const bandColor = BAND_COLORS[result.global_band];

  const linkedinText = encodeURIComponent(
    `I just scored my AI agents against the OWASP Agentic Top 10 2026.\n\nResult: ${result.global_score}/100 — "${result.archetype}" (${result.global_band})\n\n${result.archetype_subtitle}\n\nMost teams deploying agents land in "Reactive." Where do you stand?\n\nFree 12-min assessment:`
  );

  const twitterText = encodeURIComponent(
    `Scored my AI agents against OWASP Agentic 2026: ${result.global_score}/100 — "${result.archetype}" (${result.global_band})\n\n${result.archetype_subtitle}\n\nFree 12-min assessment:`
  );

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${linkedinText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;

  function handleCopy() {
    const text = `My Agent Security Score: ${result.global_score}/100 — "${result.archetype}" (${result.global_band})\n\n${result.archetype_subtitle}\n\nTake the free 12-min assessment: ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    track('Share Clicked', { channel: 'copy', band: result.global_band });
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Share your result</h2>
      <p className={styles.subtitle}>
        Archetype + score is your shareable unit — paste it to LinkedIn or copy the full post text below.
      </p>

      <div className={styles.card} style={{ borderColor: bandColor + '44' }}>
        <div className={styles.cardHeader} style={{ background: bandColor + '12' }}>
          <span className={styles.cardScore} style={{ color: bandColor }}>
            {result.global_score}/100
          </span>
          <span className={styles.cardBand} style={{ color: bandColor }}>
            {result.global_band}
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardArchetype}>{result.archetype}</div>
          <div className={styles.cardSubtitle}>{result.archetype_subtitle}</div>
          <div className={styles.cardMeta}>
            Agent Security Scorecard · OWASP Agentic 2026
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
          className={`${styles.action} ${styles.actionLinkedin}`}
          onClick={() => track('Share Clicked', { channel: 'linkedin', band: result.global_band })}>
          <ExternalLink size={15} />
          Share on LinkedIn
        </a>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
          className={`${styles.action} ${styles.actionTwitter}`}
          onClick={() => track('Share Clicked', { channel: 'twitter', band: result.global_band })}>
          <ExternalLink size={15} />
          Post on X
        </a>
        <button className={`${styles.action} ${styles.actionCopy} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
          <Copy size={15} />
          {copied ? 'Copied!' : 'Copy post text'}
        </button>
      </div>
    </div>
  );
}
