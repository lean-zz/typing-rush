import type { RunStats } from '../types';

export const calculateScore = (stats: Pick<RunStats, 'wpm' | 'accuracy' | 'wrongChars' | 'maxCombo' | 'longPauseCount'>): number => {
  const speedBase = stats.wpm * 12;
  const accuracyMultiplier = 0.4 + stats.accuracy / 100;
  const comboBonus = Math.min(1.25, 1 + stats.maxCombo / 300);
  const errorPenalty = stats.wrongChars * 1.6 + stats.longPauseCount * 8;
  const raw = speedBase * accuracyMultiplier * comboBonus - errorPenalty;

  return Math.max(0, Math.round(raw));
};
