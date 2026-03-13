import type { ResultRecord, RunStats } from '../../types';
import type { BestSummary } from '../../storage/record-aggregator';
import { HistoryPanel } from '../components/HistoryPanel';

type ResultScreenProps = {
  stats: RunStats;
  history: ResultRecord[];
  best: BestSummary;
  onBackToMenu: () => void;
};

const formatDuration = (durationMs: number): string => `${Math.round(durationMs / 60000)}m`;

export const ResultScreen = ({ stats, history, best, onBackToMenu }: ResultScreenProps) => {
  const bestByDuration = Object.entries(best.byDuration)
    .map(([duration, record]) => ({ durationMs: Number(duration), record }))
    .filter((entry): entry is { durationMs: number; record: ResultRecord } => Boolean(entry.record))
    .sort((a, b) => a.durationMs - b.durationMs);

  return (
    <section className="result-screen card">
      <header className="result-header">
        <h2>Run Complete</h2>
        <button type="button" className="button-secondary" onClick={onBackToMenu}>
          Back to Menu
        </button>
      </header>
      <div className="result-grid">
        <div>Raw KPM: <strong>{stats.rawLpm}</strong></div>
        <div>KPM: <strong>{stats.lpm}</strong></div>
        <div>Accuracy: <strong>{stats.accuracy}%</strong></div>
        <div>Max Combo: <strong>{stats.maxCombo}</strong></div>
        <div>Completed Snippets: <strong>{stats.completedSnippets}</strong></div>
      </div>

      <section className="best-grid">
        <h3>Best by Mode</h3>
        {bestByDuration.length > 0
          ? bestByDuration.map((entry) => (
              <p key={entry.durationMs}>{formatDuration(entry.durationMs)}: KPM {entry.record.stats.lpm}</p>
            ))
          : <p>-</p>}
        <h3>Best by Language</h3>
        <p>JS: {best.byLanguage.javascript ? `KPM ${best.byLanguage.javascript.stats.lpm}` : '-'}</p>
        <p>TS: {best.byLanguage.typescript ? `KPM ${best.byLanguage.typescript.stats.lpm}` : '-'}</p>
        <p>PY: {best.byLanguage.python ? `KPM ${best.byLanguage.python.stats.lpm}` : '-'}</p>
      </section>

      <HistoryPanel results={history} />
    </section>
  );
};
