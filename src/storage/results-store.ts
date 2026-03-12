import type { ResultRecord, RunConfig, RunStats } from '../types';

const RESULTS_KEY = 'typing-rush:results';
const MAX_RESULTS = 20;

export const loadResults = (): ResultRecord[] => {
  const raw = localStorage.getItem(RESULTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ResultRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const appendResult = (config: RunConfig, stats: RunStats): ResultRecord => {
  const record: ResultRecord = {
    id: crypto.randomUUID(),
    finishedAt: new Date().toISOString(),
    config,
    stats
  };

  const next = [record, ...loadResults()].slice(0, MAX_RESULTS);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
  return record;
};
