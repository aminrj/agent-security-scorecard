import { useState, useRef } from 'react';
import type { AssessmentResult, Answers, ContextData } from '../../data/scoring';
import { BAND_COLORS, BAND_DESCRIPTIONS, encodeAnswers } from '../../data/scoring';
import { RadarChart } from './RadarChart';
import { TopRisks } from './TopRisks';
import { DomainBreakdown } from './DomainBreakdown';
import { EmailGate } from '../EmailGate';
import { ShareCard } from './ShareCard';
import { RotateCcw, Download, Share2, Shield } from 'lucide-react';
import styles from './ResultsScreen.module.css';

interface Props {
  result: AssessmentResult;
  answers: Answers;
  context: ContextData;
  onRestart: () => void;
}

export function ResultsScreen({ result, answers, context, onRestart }: Props) {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const emailSectionRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const bandColor = BAND_COLORS[result.global_band];
  const shareUrl = `${window.location.origin}${window.location.pathname}#r=${encodeAnswers(answers)}`;

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `My Agent Security Score: ${result.global_score}/100 — ${result.archetype}`,
        text: `I scored ${result.global_score}/100 on the OWASP Agentic 2026 self-assessment. I'm a "${result.archetype}" — ${result.archetype_subtitle} Take the 12-minute assessment:`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Result link copied to clipboard!');
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    alert('Result link copied to clipboard!');
  }

  return (
    <div className={styles.root} ref={resultsRef}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Shield size={18} color="#6366f1" />
          <span>Agent Security Scorecard</span>
        </div>
        <button className={styles.navRestart} onClick={onRestart}>
          <RotateCcw size={14} />
          Retake
        </button>
      </nav>

      <div className={styles.container}>
        {/* Headline card */}
        <div className={styles.heroCard} style={{ borderColor: bandColor + '44' }}>
          <div className={styles.bandBadge} style={{ color: bandColor, background: bandColor + '18', borderColor: bandColor + '44' }}>
            {result.global_band}
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.scoreNum} style={{ color: bandColor }}>
              {result.global_score}
            </span>
            <span className={styles.scoreOf}>/100</span>
          </div>
          <h1 className={styles.archetype}>{result.archetype}</h1>
          <p className={styles.archetypeSubtitle}>{result.archetype_subtitle}</p>
          <p className={styles.bandDesc}>{BAND_DESCRIPTIONS[result.global_band]}</p>

          <div className={styles.heroActions}>
            <button className={styles.shareBtn} onClick={handleShare}>
              <Share2 size={15} />
              Share result
            </button>
            <button className={styles.copyBtn} onClick={handleCopyLink}>
              Copy link
            </button>
            <button
              className={styles.reportBtn}
              onClick={() => {
                setEmailSubmitted(false);
                setTimeout(() => emailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
              }}
            >
              <Download size={15} />
              Get PDF report
            </button>
          </div>
        </div>

        {/* Radar + benchmark */}
        <div className={styles.radarSection}>
          <div className={styles.radarWrap}>
            <h2 className={styles.sectionTitle}>Your security posture</h2>
            <p className={styles.sectionSub}>
              Each axis is one domain. The dashed ring is the Resilient target (76+).
            </p>
            <RadarChart result={result} />
          </div>
          <div className={styles.benchmarkCard}>
            <div className={styles.benchmarkTitle}>Where most teams land</div>
            <div className={styles.benchmarkText}>
              Most teams currently deploying AI agents score in the{' '}
              <strong>Reactive band (26–50)</strong> — some ad hoc controls,
              but no full coverage. A "Managed" posture puts you in the top 25%.
            </div>
            <div className={styles.benchmarkNote}>
              Benchmark will update with real peer data as submissions grow.
            </div>

            {context.agents_in_prod && context.agents_in_prod !== 'None yet' && (
              <div className={styles.contextNote}>
                With {context.agents_in_prod} agents in production, Identity and
                Detection gaps carry the highest incident probability.
              </div>
            )}

            {result.global_score <= 50 && (
              <a
                href="https://molntek.com/services/ai-security-assessment"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sprintCta}
              >
                <span>Want expert help closing these gaps?</span>
                <span className={styles.sprintCtaLink}>
                  Molntek AI Security Sprint →
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Top 3 risks */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your three biggest risks</h2>
          <p className={styles.sectionSub}>
            Ranked by score gap. Each includes the OWASP ASI item, a concrete first action, and a verification check.
          </p>
          <TopRisks risks={result.top3_risks} />
        </section>

        {/* Domain breakdown */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Full domain breakdown</h2>
          <DomainBreakdown domainResults={result.domain_results} />
        </section>

        {/* Email gate */}
        {!emailSubmitted ? (
          <section className={styles.emailSection} ref={emailSectionRef}>
            <EmailGate
              result={result}
              answers={answers}
              onSubmitted={() => setEmailSubmitted(true)}
            />
          </section>
        ) : (
          <section className={styles.emailDoneSection}>
            <div className={styles.emailDone}>
              ✓ PDF downloaded — check your Downloads folder. You're also subscribed to AI Security Intelligence.
            </div>
          </section>
        )}

        {/* Share card */}
        <section className={styles.section}>
          <ShareCard result={result} shareUrl={shareUrl} />
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            Grounded in{' '}
            <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer">
              OWASP Top 10 for Agentic Applications 2026
            </a>{' '}
            (ASI01–ASI10). No data stored. All scoring is client-side.
          </p>
          <button className={styles.restartLink} onClick={onRestart}>
            ← Retake the assessment
          </button>
        </footer>
      </div>
    </div>
  );
}
