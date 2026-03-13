import { transition } from '../engine/state-machine';
import { createInitialStats } from '../engine/stats-base';
import { recalculateLiveStats } from '../engine/stats';
import { applyBackspace, applyTypingInput } from '../engine/input-judge';
import { filterSnippets, normalizeSnippetText } from '../content/snippet-filter';
import { SNIPPETS } from '../content/snippets';
import { refillQueue, takeNextSnippet, type QueueState } from '../content/snippet-queue';
import type { AppScreen, RunConfig, RunSession } from '../types';

export type AppModel = {
  screen: AppScreen;
  countdown: number;
  session: RunSession | null;
};

export type ControlKeyResult = {
  handled: boolean;
  screen: AppScreen;
  session: RunSession | null;
};

const createInitialQueue = (): QueueState => ({ queueOfNextSnippets: [], recentSnippetIds: [] });

export const createRunSession = (config: RunConfig, now: number): RunSession => {
  const filtered = filterSnippets(SNIPPETS, config.language, config.difficulty);
  const selectedSnippet = config.snippetId ? filtered.find((snippet) => snippet.id === config.snippetId) : undefined;
  const first = selectedSnippet
    ? {
        snippet: selectedSnippet,
        state: refillQueue(filtered, {
          queueOfNextSnippets: [],
          recentSnippetIds: [selectedSnippet.id]
        })
      }
    : takeNextSnippet(filtered, createInitialQueue());

  return {
    config,
    stats: createInitialStats(),
    currentSnippet: first.snippet,
    currentIndex: 0,
    timeRemainingMs: config.durationMs,
    isFocused: true,
    queueOfNextSnippets: first.state.queueOfNextSnippets,
    recentSnippetIds: first.state.recentSnippetIds,
    mistakesByIndex: {},
    startedAt: now,
    lastTickAt: now,
    feedbackMessage: '',
    lastFeedbackMinute: 0
  };
};

export const applyInputToSession = (session: RunSession, key: string, now: number): RunSession => {
  const snippetText = normalizeSnippetText(session.currentSnippet.content);

  if (key === 'Backspace') {
    const backspaceResult = applyBackspace(session.currentIndex, session.stats);
    const withLiveStats = recalculateLiveStats(
      backspaceResult.stats,
      session.config.durationMs - session.timeRemainingMs
    );

    return {
      ...session,
      currentIndex: backspaceResult.nextIndex,
      stats: withLiveStats
    };
  }

  const expectedChar = snippetText[session.currentIndex] ?? '';
  const typedText =
    key === 'Tab'
      ? '  '
      : session.config.language === 'english' && key === ' ' && expectedChar === '\n'
        ? '\n'
        : key === 'Enter'
          ? '\n'
          : key;
  const judged = applyTypingInput(
    typedText,
    snippetText,
    session.currentIndex,
    session.mistakesByIndex,
    session.stats,
    now
  );

  if (!judged.snippetCompleted) {
    return {
      ...session,
      currentIndex: judged.nextIndex,
      mistakesByIndex: judged.mistakesByIndex,
      stats: recalculateLiveStats(judged.stats, session.config.durationMs - session.timeRemainingMs)
    };
  }

  const filtered = filterSnippets(SNIPPETS, session.config.language, session.config.difficulty);
  const next = takeNextSnippet(filtered, {
    queueOfNextSnippets: session.queueOfNextSnippets,
    recentSnippetIds: session.recentSnippetIds
  });

  const nextStats = recalculateLiveStats(
    {
      ...judged.stats,
      completedSnippets: judged.stats.completedSnippets + 1,
      combo: 0
    },
    session.config.durationMs - session.timeRemainingMs
  );

  return {
    ...session,
    currentSnippet: next.snippet,
    currentIndex: 0,
    queueOfNextSnippets: next.state.queueOfNextSnippets,
    recentSnippetIds: next.state.recentSnippetIds,
    mistakesByIndex: {},
    stats: nextStats
  };
};

export const startTimerOnFirstInput = (previous: RunSession, next: RunSession, now: number): RunSession => {
  if (previous.stats.totalTypedChars > 0 || next.stats.totalTypedChars <= 0) {
    return next;
  }

  return {
    ...next,
    startedAt: now,
    lastTickAt: now
  };
};

export const tickSession = (session: RunSession, now: number): { session: RunSession; finished: boolean } => {
  const elapsed = now - session.lastTickAt;
  const remaining = Math.max(0, session.timeRemainingMs - elapsed);
  const elapsedTotal = session.config.durationMs - remaining;
  const minute = Math.floor(elapsedTotal / 60000);
  const shouldUpdateFeedback = minute > 0 && minute > session.lastFeedbackMinute;

  const updated = {
    ...session,
    lastTickAt: now,
    timeRemainingMs: remaining,
    feedbackMessage: shouldUpdateFeedback ? `Minute ${minute}: keep the rhythm.` : session.feedbackMessage,
    lastFeedbackMinute: shouldUpdateFeedback ? minute : session.lastFeedbackMinute,
    stats: recalculateLiveStats(session.stats, elapsedTotal)
  };

  return { session: updated, finished: remaining <= 0 };
};

export const nextScreen = (screen: AppScreen, type: Parameters<typeof transition>[1]['type']): AppScreen => {
  return transition({ screen }, { type }).screen;
};

export const applyControlKey = (
  screen: AppScreen,
  session: RunSession | null,
  key: string,
  now: number
): ControlKeyResult => {
  if (key !== 'Escape' || !session) {
    return { handled: false, screen, session };
  }

  if (screen === 'playing') {
    return {
      handled: true,
      screen: nextScreen(screen, 'PAUSE'),
      session
    };
  }

  if (screen === 'paused') {
    return {
      handled: true,
      screen: nextScreen(screen, 'RESUME'),
      session: { ...session, isFocused: true, lastTickAt: now }
    };
  }

  return { handled: false, screen, session };
};

