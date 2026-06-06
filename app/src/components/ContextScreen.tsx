import { useState } from 'react';
import { ChevronRight, SkipForward } from 'lucide-react';
import type { ContextData } from '../data/scoring';
import styles from './ContextScreen.module.css';

interface Props {
  onDone: (ctx: ContextData) => void;
  onSkip: () => void;
}

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'];
const AGENTS_IN_PROD = ['None yet', '1–2', '3–10', '11–50', '50+'];
const DEPLOYMENT_STAGES = [
  'Exploring / prototyping',
  'Piloting in dev/staging',
  'One agent in production',
  'Multiple agents in production',
  'Agents at scale / enterprise',
];

export function ContextScreen({ onDone, onSkip }: Props) {
  const [ctx, setCtx] = useState<ContextData>({});

  function set(key: keyof ContextData, value: string) {
    setCtx((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.step}>Optional — 30 seconds</div>
          <h1 className={styles.title}>A bit about your situation</h1>
          <p className={styles.subtitle}>
            This helps tailor your archetype and benchmark framing. Completely optional — skip anytime.
          </p>
        </div>

        <div className={styles.fields}>
          <OptionField
            label="Company size"
            options={COMPANY_SIZES}
            value={ctx.company_size}
            onChange={(v) => set('company_size', v)}
          />
          <OptionField
            label="Agents currently in production"
            options={AGENTS_IN_PROD}
            value={ctx.agents_in_prod}
            onChange={(v) => set('agents_in_prod', v)}
          />
          <OptionField
            label="Your deployment stage"
            options={DEPLOYMENT_STAGES}
            value={ctx.deployment_stage}
            onChange={(v) => set('deployment_stage', v)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.skip} onClick={onSkip}>
            <SkipForward size={15} />
            Skip this step
          </button>
          <button className={styles.next} onClick={() => onDone(ctx)}>
            Continue to assessment
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface OptionFieldProps {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}

function OptionField({ label, options, value, onChange }: OptionFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.pills}>
        {options.map((opt) => (
          <button
            key={opt}
            className={`${styles.pill} ${value === opt ? styles.pillActive : ''}`}
            onClick={() => onChange(opt)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
