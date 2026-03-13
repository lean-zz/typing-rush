import type { Language, ResultRecord, RunConfig, RunDuration } from '../types';

export type BestSummary = {
  byDuration: Partial<Record<RunDuration, ResultRecord>>;
  byLanguage: Partial<Record<Language, ResultRecord>>;
};

export type MenuScoreAverage = {
  accuracy: number;
  lpm: number;
};

export type MenuScoreSummary = {
  bestRecord: ResultRecord | null;
  recentRecords: ResultRecord[];
  recentAverage: MenuScoreAverage | null;
  hasRecords: boolean;
};

const RECENT_LIMIT = 5;

const roundMetric = (value: number): number => Math.round(value * 10) / 10;
const isBetterRecord = (candidate: ResultRecord, current: ResultRecord): boolean =>
  candidate.stats.lpm > current.stats.lpm ||
  (candidate.stats.lpm === current.stats.lpm && candidate.stats.accuracy > current.stats.accuracy);

export const aggregateBestResults = (results: ResultRecord[]): BestSummary => {
  const byDuration: BestSummary['byDuration'] = {};
  const byLanguage: BestSummary['byLanguage'] = {};

  for (const record of results) {
    const existingByDuration = byDuration[record.config.durationMs];
    if (!existingByDuration || isBetterRecord(record, existingByDuration)) {
      byDuration[record.config.durationMs] = record;
    }

    const existingByLanguage = byLanguage[record.config.language];
    if (!existingByLanguage || isBetterRecord(record, existingByLanguage)) {
      byLanguage[record.config.language] = record;
    }
  }

  return { byDuration, byLanguage };
};

export const aggregateMenuScoreSummary = (results: ResultRecord[], config: RunConfig): MenuScoreSummary => {
  const filtered = results.filter(
    (record) =>
      record.config.language === config.language &&
      record.config.difficulty === config.difficulty
  );

  const recentRecords = filtered.slice(0, RECENT_LIMIT);

  if (recentRecords.length === 0) {
    return {
      bestRecord: null,
      recentRecords: [],
      recentAverage: null,
      hasRecords: false
    };
  }

  const bestRecord = filtered.reduce((best, record) => (isBetterRecord(record, best) ? record : best), filtered[0]);
  const totals = recentRecords.reduce(
    (acc, record) => ({
      accuracy: acc.accuracy + record.stats.accuracy,
      lpm: acc.lpm + record.stats.lpm
    }),
    { accuracy: 0, lpm: 0 }
  );

  return {
    bestRecord,
    recentRecords,
    recentAverage: {
      accuracy: roundMetric(totals.accuracy / recentRecords.length),
      lpm: roundMetric(totals.lpm / recentRecords.length)
    },
    hasRecords: true
  };
};
