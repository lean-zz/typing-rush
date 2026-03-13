import type { Language, RunConfig, RunDuration } from '../types';

const SETTINGS_KEY = 'typing-rush:settings';
const MIN_DURATION_MS = 60000;
const MAX_DURATION_MS = 3600000;

export type AppSettings = {
  defaultDurationMs: RunDuration;
  defaultLanguage: Language;
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
};

export const defaultSettings: AppSettings = {
  defaultDurationMs: 300000,
  defaultLanguage: 'typescript',
  defaultDifficulty: 'easy',
  soundEnabled: true
};

const sanitizeDurationMs = (value: unknown): RunDuration => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return defaultSettings.defaultDurationMs;
  }

  const rounded = Math.round(numeric / 1000) * 1000;
  return Math.max(MIN_DURATION_MS, Math.min(MAX_DURATION_MS, rounded));
};

export const loadSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      defaultDurationMs: sanitizeDurationMs(parsed.defaultDurationMs)
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      defaultDurationMs: sanitizeDurationMs(settings.defaultDurationMs)
    })
  );
};

export const toRunConfig = (settings: AppSettings): RunConfig => ({
  durationMs: sanitizeDurationMs(settings.defaultDurationMs),
  language: settings.defaultLanguage,
  difficulty: settings.defaultDifficulty,
  soundEnabled: settings.soundEnabled
});
