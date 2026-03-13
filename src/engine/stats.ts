import { round2 } from './stats-base';
import type { RunStats } from '../types';

export const recalculateLiveStats = (stats: RunStats, elapsedMs: number): RunStats => {
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const rawLpm = round2(stats.totalTypedChars / elapsedMinutes);
  const lpm = round2(stats.correctChars / elapsedMinutes);
  const totalJudgedChars = stats.correctChars + stats.wrongChars;
  const accuracy = totalJudgedChars === 0 ? 100 : round2((stats.correctChars / totalJudgedChars) * 100);

  return { ...stats, rawLpm, lpm, accuracy };
};
