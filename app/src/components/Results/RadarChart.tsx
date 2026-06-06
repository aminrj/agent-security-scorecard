import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { AssessmentResult } from '../../data/scoring';
import { DOMAINS } from '../../data/questions';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  result: AssessmentResult;
}

export function RadarChart({ result }: Props) {
  const labels = DOMAINS.map((d) => d.shortName);
  const targetData = new Array(DOMAINS.length).fill(76);

  const data = {
    labels,
    datasets: [
      {
        label: 'Target (Resilient)',
        data: targetData,
        borderColor: 'rgba(99, 102, 241, 0.3)',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Your score',
        data: result.radar_data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: DOMAINS.map((d) => d.color),
        pointBorderColor: 'transparent',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          display: true,
          color: 'rgba(79, 87, 105, 0.6)',
          font: { size: 10, family: 'JetBrains Mono' },
          backdropColor: 'transparent',
        },
        grid: {
          color: 'rgba(30, 33, 48, 0.8)',
        },
        angleLines: {
          color: 'rgba(30, 33, 48, 0.8)',
        },
        pointLabels: {
          color: '#8892a4',
          font: {
            size: 12,
            weight: 'bold' as const,
            family: 'JetBrains Mono',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#8892a4',
          font: { size: 11, family: 'Inter' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111318',
        borderColor: '#1e2130',
        borderWidth: 1,
        titleColor: '#f0f2f8',
        bodyColor: '#8892a4',
        padding: 10,
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}/100`,
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <Radar data={data} options={options} />
    </div>
  );
}
