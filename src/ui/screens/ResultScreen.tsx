import type { ResultRecord, RunStats } from '../../types';
import type { BestSummary } from '../../storage/record-aggregator';
import { HistoryPanel } from '../components/HistoryPanel';

type ResultScreenProps = {
  stats: RunStats;
  history: ResultRecord[];
  best: BestSummary;
  onBackToMenu: () => void;
};

export const ResultScreen = ({ stats, history, best, onBackToMenu }: ResultScreenProps) => (
  <section className="result-screen card">
    <h2>Run Complete</h2>
    <div className="result-grid">
      <div>Raw LPM: <strong>{stats.rawLpm}</strong></div>
      <div>LPM: <strong>{stats.lpm}</strong></div>
      <div>Accuracy: <strong>{stats.accuracy}%</strong></div>
      <div>Score: <strong>{stats.score}</strong></div>
      <div>Max Combo: <strong>{stats.maxCombo}</strong></div>
      <div>Completed Snippets: <strong>{stats.completedSnippets}</strong></div>
    </div>

    <section className="best-grid">
      <h3>Best by Mode</h3>
      <p>5m: {best.byDuration[300000]?.stats.score ?? '-'}</p>
      <p>10m: {best.byDuration[600000]?.stats.score ?? '-'}</p>
      <h3>Best by Language</h3>
      <p>JS: {best.byLanguage.javascript?.stats.score ?? '-'}</p>
      <p>TS: {best.byLanguage.typescript?.stats.score ?? '-'}</p>
      <p>PY: {best.byLanguage.python?.stats.score ?? '-'}</p>
    </section>

    <HistoryPanel results={history} />
    <button onClick={onBackToMenu}>Back to Menu</button>
  </section>
);

