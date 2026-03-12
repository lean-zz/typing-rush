import type { RunStats } from '../types';

export type InputResult = {
  nextIndex: number;
  mistakesByIndex: Record<number, number>;
  stats: RunStats;
  snippetCompleted: boolean;
};

const LONG_PAUSE_MS = 3000;

export const applyTypingInput = (
  text: string,
  snippetText: string,
  currentIndex: number,
  mistakesByIndex: Record<number, number>,
  stats: RunStats,
  timestamp: number
): InputResult => {
  let index = currentIndex;
  const nextMistakes = { ...mistakesByIndex };
  let nextStats = { ...stats };

  if (nextStats.lastInputAt !== null && timestamp - nextStats.lastInputAt >= LONG_PAUSE_MS) {
    nextStats.longPauseCount += 1;
  }

  for (const char of text) {
    nextStats.totalTypedChars += 1;
    const expected = snippetText[index] ?? '';

    if (char === expected) {
      index += 1;
      nextStats.correctChars += 1;
      nextStats.combo += 1;
      nextStats.maxCombo = Math.max(nextStats.maxCombo, nextStats.combo);
    } else {
      nextStats.wrongChars += 1;
      nextStats.combo = 0;
      nextMistakes[index] = (nextMistakes[index] ?? 0) + 1;
    }
  }

  nextStats.lastInputAt = timestamp;

  return {
    nextIndex: index,
    mistakesByIndex: nextMistakes,
    stats: nextStats,
    snippetCompleted: index >= snippetText.length
  };
};

export const applyBackspace = (currentIndex: number, stats: RunStats): { nextIndex: number; stats: RunStats } => {
  if (currentIndex <= 0) {
    return { nextIndex: 0, stats: { ...stats, backspaceCount: stats.backspaceCount + 1, combo: 0 } };
  }

  return {
    nextIndex: currentIndex - 1,
    stats: {
      ...stats,
      backspaceCount: stats.backspaceCount + 1,
      correctChars: Math.max(0, stats.correctChars - 1),
      combo: 0
    }
  };
};
