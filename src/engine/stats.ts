import { calculateScore } from './score';
import { round2 } from './stats-base';
import type { RunStats } from '../types';

export const recalculateLiveStats = (stats: RunStats, elapsedMs: number): RunStats => {
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60000);
  const rawWpm = round2(stats.totalTypedChars / 5 / elapsedMinutes);
  const wpm = round2(stats.correctChars / 5 / elapsedMinutes);
  const totalJudgedChars = stats.correctChars + stats.wrongChars;
  const accuracy = totalJudgedChars === 0 ? 100 : round2((stats.correctChars / totalJudgedChars) * 100);
  const score = calculateScore({
    wpm,
    accuracy,
    wrongChars: stats.wrongChars,
    maxCombo: stats.maxCombo,
    longPauseCount: stats.longPauseCount
  });

  return { ...stats, rawWpm, wpm, accuracy, score };
};
