import type { ResultRecord } from '../../types';

type HistoryPanelProps = {
  results: ResultRecord[];
};

export const HistoryPanel = ({ results }: HistoryPanelProps) => (
  <section className="history-panel">
    <h3>Recent (max 20)</h3>
    <ul>
      {results.slice(0, 5).map((record) => (
        <li key={record.id}>
          <span>{new Date(record.finishedAt).toLocaleString()}</span>
          <strong>{record.stats.score}</strong>
        </li>
      ))}
      {results.length === 0 ? <li>No records yet.</li> : null}
    </ul>
  </section>
);

