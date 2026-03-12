import type { Language, RunDuration, RunConfig } from '../types';

const SETTINGS_KEY = 'typing-rush:settings';

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

export const loadSettings = (): AppSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const toRunConfig = (settings: AppSettings): RunConfig => ({
  durationMs: settings.defaultDurationMs,
  language: settings.defaultLanguage,
  difficulty: settings.defaultDifficulty,
  soundEnabled: settings.soundEnabled
});
