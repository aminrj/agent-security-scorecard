import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { ContextScreen } from './components/ContextScreen';
import { AssessmentScreen } from './components/Assessment/AssessmentScreen';
import { ComputingScreen } from './components/ComputingScreen';
import { ResultsScreen } from './components/Results/ResultsScreen';
import type { Answers, ContextData, AssessmentResult } from './data/scoring';
import { computeResult, decodeAnswers } from './data/scoring';
import { getUtmParams } from './utils/utm';
import { track } from './utils/analytics';

export type Screen = 'landing' | 'context' | 'assessment' | 'computing' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [answers, setAnswers] = useState<Answers>({});
  const [context, setContext] = useState<ContextData>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    // Capture UTMs on first load so they survive the multi-screen flow
    getUtmParams();

    const hash = window.location.hash.slice(1);
    if (hash.startsWith('r=')) {
      const encoded = hash.slice(2);
      const decoded = decodeAnswers(encoded);
      if (Object.keys(decoded).length > 0) {
        const computed = computeResult(decoded);
        setAnswers(decoded);
        setResult(computed);
        setScreen('results');
      }
    }
  }, []);

  function handleStart() {
    track('Assessment Started');
    setScreen('context');
  }

  function handleContextDone(ctx: ContextData) {
    setContext(ctx);
    setScreen('assessment');
  }

  function handleAssessmentComplete(a: Answers) {
    setAnswers(a);
    track('Assessment Completed');
    setScreen('computing');
  }

  function handleComputingDone() {
    const computed = computeResult(answers);
    setResult(computed);
    track('Results Viewed', { band: computed.global_band, score: computed.global_score, archetype: computed.archetype });
    setScreen('results');
  }

  function handleRestart() {
    setAnswers({});
    setContext({});
    setResult(null);
    window.location.hash = '';
    setScreen('landing');
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {screen === 'landing' && <Landing onStart={handleStart} />}
      {screen === 'context' && (
        <ContextScreen onDone={handleContextDone} onSkip={() => handleContextDone({})} />
      )}
      {screen === 'assessment' && (
        <AssessmentScreen
          initialAnswers={answers}
          onComplete={handleAssessmentComplete}
          onBack={() => setScreen('context')}
        />
      )}
      {screen === 'computing' && (
        <ComputingScreen answers={answers} onDone={handleComputingDone} />
      )}
      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          answers={answers}
          context={context}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
