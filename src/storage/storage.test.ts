import { beforeEach, describe, expect, it } from 'vitest';
import { aggregateBestResults, aggregateMenuScoreSummary } from './record-aggregator';
import { appendResult, loadResults } from './results-store';
import { defaultSettings, loadSettings, saveSettings, toRunConfig } from './settings-store';
import type { ResultRecord, RunConfig, RunStats } from '../types';

const createStats = (accuracy = 90, lpm = 10): RunStats => ({
  totalTypedChars: 10,
  correctChars: 9,
  wrongChars: 1,
  backspaceCount: 0,
  rawLpm: lpm + 2,
  lpm,
  accuracy,
  combo: 0,
  maxCombo: 4,
  completedSnippets: 1,
  lastInputAt: null,
  longPauseCount: 0
});

const createRecord = (overrides: Partial<ResultRecord> & { id: string; config: RunConfig; stats: RunStats }): ResultRecord => ({
  finishedAt: '2026-03-13T10:00:00.000Z',
  ...overrides
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings when nothing is stored', () => {
    expect(loadSettings()).toEqual(defaultSettings);
  });

  it('saves and reloads settings with custom duration', () => {
    saveSettings({
      ...defaultSettings,
      defaultDifficulty: 'hard',
      defaultDurationMs: 720000
    });

    const loaded = loadSettings();
    expect(loaded.defaultDifficulty).toBe('hard');
    expect(loaded.defaultDurationMs).toBe(720000);
  });

  it('fills missing settings fields from defaults', () => {
    localStorage.setItem(
      'typing-rush:settings',
      JSON.stringify({
        defaultDurationMs: 300000,
        defaultLanguage: 'typescript',
        defaultDifficulty: 'easy',
        soundEnabled: true
      })
    );

    expect(loadSettings()).toEqual(defaultSettings);
  });

  it('stores up to 20 result records and aggregates best by kpm then accuracy', () => {
    const config = toRunConfig(defaultSettings);
    appendResult(config, createStats(90, 12));
    appendResult(config, createStats(95, 12));

    const results = loadResults();
    const best = aggregateBestResults(results);

    expect(results.length).toBe(2);
    expect(best.byDuration[config.durationMs]?.stats.lpm).toBe(12);
    expect(best.byDuration[config.durationMs]?.stats.accuracy).toBe(95);
  });

  it('builds menu score summary from language and difficulty only', () => {
    const config = toRunConfig(defaultSettings);
    const differentDurationConfig: RunConfig = {
      ...config,
      durationMs: 600000
    };
    const otherConfig: RunConfig = {
      ...config,
      difficulty: 'hard'
    };

    const results: ResultRecord[] = [
      createRecord({
        id: 'recent-1',
        finishedAt: '2026-03-13T10:05:00.000Z',
        config,
        stats: createStats(95, 22)
      }),
      createRecord({
        id: 'recent-2',
        finishedAt: '2026-03-13T10:04:00.000Z',
        config,
        stats: createStats(90, 18)
      }),
      createRecord({
        id: 'recent-3',
        finishedAt: '2026-03-13T10:03:00.000Z',
        config,
        stats: createStats(85, 16)
      }),
      createRecord({
        id: 'recent-4',
        finishedAt: '2026-03-13T10:02:00.000Z',
        config,
        stats: createStats(80, 14)
      }),
      createRecord({
        id: 'recent-5',
        finishedAt: '2026-03-13T10:01:00.000Z',
        config,
        stats: createStats(75, 10)
      }),
      createRecord({
        id: 'recent-6',
        finishedAt: '2026-03-13T10:00:00.000Z',
        config: differentDurationConfig,
        stats: createStats(70, 8)
      }),
      createRecord({
        id: 'other',
        finishedAt: '2026-03-13T09:59:00.000Z',
        config: otherConfig,
        stats: createStats(99, 99)
      })
    ];

    const summary = aggregateMenuScoreSummary(results, config);

    expect(summary.hasRecords).toBe(true);
    expect(summary.bestRecord?.id).toBe('recent-1');
    expect(summary.recentRecords).toHaveLength(5);
    expect(summary.recentRecords.map((record) => record.id)).toEqual(['recent-1', 'recent-2', 'recent-3', 'recent-4', 'recent-5']);
    expect(summary.recentAverage).toEqual({
      accuracy: 85,
      lpm: 16
    });
  });

  it('returns empty menu summary when no records match language and difficulty', () => {
    const config = toRunConfig(defaultSettings);
    const results: ResultRecord[] = [
      createRecord({
        id: 'other',
        config: { ...config, language: 'python' },
        stats: createStats()
      })
    ];

    expect(aggregateMenuScoreSummary(results, config)).toEqual({
      bestRecord: null,
      recentRecords: [],
      recentAverage: null,
      hasRecords: false
    });
  });
});
