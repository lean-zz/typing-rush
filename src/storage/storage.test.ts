import { beforeEach, describe, expect, it } from 'vitest';
import { aggregateBestResults } from './record-aggregator';
import { appendResult, loadResults } from './results-store';
import { defaultSettings, loadSettings, saveSettings, toRunConfig } from './settings-store';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings when nothing is stored', () => {
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it('saves and reloads settings', () => {
    saveSettings({ ...defaultSettings, defaultDifficulty: 'hard' });
    expect(loadSettings().defaultDifficulty).toBe('hard');
  });

  it('stores up to 20 result records and aggregates best', () => {
    const config = toRunConfig(defaultSettings);
    appendResult(config, {
      totalTypedChars: 10,
      correctChars: 9,
      wrongChars: 1,
      backspaceCount: 0,
      rawWpm: 12,
      wpm: 10,
      accuracy: 90,
      score: 100,
      combo: 0,
      maxCombo: 4,
      completedSnippets: 1,
      lastInputAt: null,
      longPauseCount: 0
    });

    appendResult(config, {
      totalTypedChars: 10,
      correctChars: 9,
      wrongChars: 1,
      backspaceCount: 0,
      rawWpm: 13,
      wpm: 11,
      accuracy: 90,
      score: 150,
      combo: 0,
      maxCombo: 4,
      completedSnippets: 1,
      lastInputAt: null,
      longPauseCount: 0
    });

    const results = loadResults();
    const best = aggregateBestResults(results);

    expect(results.length).toBe(2);
    expect(best.byDuration[config.durationMs]?.stats.score).toBe(150);
  });
});
