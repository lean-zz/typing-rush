import type { ResultRecord } from '../../types';
import { formatEnglishTimestamp } from '../formatters/date-time';

type HistoryPanelProps = {
  results: ResultRecord[];
};

export const HistoryPanel = ({ results }: HistoryPanelProps) => (
  <section className="history-panel">
    <h3>Recent (max 20)</h3>
    <ul>
      {results.slice(0, 5).map((record) => (
        <li key={record.id}>
          <span className="history-timestamp">{formatEnglishTimestamp(record.finishedAt)}</span>
          <strong>KPM {record.stats.lpm}</strong>
          <strong>Acc {record.stats.accuracy}%</strong>
        </li>
      ))}
      {results.length === 0 ? <li>No records yet.</li> : null}
    </ul>
  </section>
);
