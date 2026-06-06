import type { RoadmapItem } from '../../data/scoring';
import styles from './RoadmapSection.module.css';

interface Props {
  items: RoadmapItem[];
}

export function RoadmapSection({ items }: Props) {
  if (items.length === 0) return null;

  const title = items.length < 3 ? 'Your priorities' : 'Your 30-day order of operations';

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.sub}>Tackle these in order. Each builds on the last.</p>
      </div>
      <ol className={styles.list}>
        {items.map((item, i) => (
          <li key={item.question.id} className={styles.item}>
            <div className={styles.num}>{i + 1}</div>
            <div className={styles.body}>
              <span className={styles.action}>{item.action}.</span>
              <span className={styles.tag}>{item.asi_tag}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
