import type { RunStats } from '../types';

export const createInitialStats = (): RunStats => ({
  totalTypedChars: 0,
  correctChars: 0,
  wrongChars: 0,
  backspaceCount: 0,
  rawLpm: 0,
  lpm: 0,
  accuracy: 100,
  combo: 0,
  maxCombo: 0,
  completedSnippets: 0,
  lastInputAt: null,
  longPauseCount: 0
});

export const round2 = (value: number): number => Math.round(value * 100) / 100;

