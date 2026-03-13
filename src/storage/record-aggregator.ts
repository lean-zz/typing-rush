import type { Language, ResultRecord, RunDuration } from '../types';

export type BestSummary = {
  byDuration: Partial<Record<RunDuration, ResultRecord>>;
  byLanguage: Partial<Record<Language, ResultRecord>>;
};

export const aggregateBestResults = (results: ResultRecord[]): BestSummary => {
  const byDuration: BestSummary['byDuration'] = {};
  const byLanguage: BestSummary['byLanguage'] = {};

  for (const record of results) {
    const existingByDuration = byDuration[record.config.durationMs];
    if (!existingByDuration || existingByDuration.stats.score < record.stats.score) {
      byDuration[record.config.durationMs] = record;
    }

    const existingByLanguage = byLanguage[record.config.language];
    if (!existingByLanguage || existingByLanguage.stats.score < record.stats.score) {
      byLanguage[record.config.language] = record;
    }
  }

  return { byDuration, byLanguage };
};

