import type { RunStats } from '../../types';

type HudPanelProps = {
  stats: RunStats;
  timeRemainingMs: number;
};

const toClock = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const HudPanel = ({ stats, timeRemainingMs }: HudPanelProps) => {
  return (
    <section className="hud-panel">
      <div><span>Time</span><strong>{toClock(timeRemainingMs)}</strong></div>
      <div><span>Raw WPM</span><strong>{stats.rawWpm}</strong></div>
      <div><span>WPM</span><strong>{stats.wpm}</strong></div>
      <div><span>Accuracy</span><strong>{stats.accuracy}%</strong></div>
      <div><span>Score</span><strong>{stats.score}</strong></div>
      <div><span>Combo</span><strong>{stats.combo}</strong></div>
      <div><span>Max Combo</span><strong>{stats.maxCombo}</strong></div>
      <div><span>Completed</span><strong>{stats.completedSnippets}</strong></div>
    </section>
  );
};
