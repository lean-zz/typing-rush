export type Language = 'javascript' | 'typescript' | 'python';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type RunDuration = 300000 | 600000;
export type AppScreen = 'menu' | 'countdown' | 'playing' | 'paused' | 'result';

export type Snippet = {
  id: string;
  language: Language;
  difficulty: Difficulty;
  title: string;
  content: string;
  tags: string[];
};

export type RunConfig = {
  durationMs: RunDuration;
  language: Language;
  difficulty: Difficulty;
  soundEnabled: boolean;
};

export type RunStats = {
  totalTypedChars: number;
  correctChars: number;
  wrongChars: number;
  backspaceCount: number;
  rawWpm: number;
  wpm: number;
  accuracy: number;
  score: number;
  combo: number;
  maxCombo: number;
  completedSnippets: number;
  lastInputAt: number | null;
  longPauseCount: number;
};

export type ResultRecord = {
  id: string;
  finishedAt: string;
  config: RunConfig;
  stats: RunStats;
};

export type RunSession = {
  config: RunConfig;
  stats: RunStats;
  currentSnippet: Snippet;
  currentIndex: number;
  timeRemainingMs: number;
  isFocused: boolean;
  queueOfNextSnippets: Snippet[];
  recentSnippetIds: string[];
  mistakesByIndex: Record<number, number>;
  startedAt: number;
  lastTickAt: number;
  feedbackMessage: string;
  lastFeedbackMinute: number;
};
