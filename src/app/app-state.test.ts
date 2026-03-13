import { describe, expect, it } from 'vitest';
import { applyControlKey, applyInputToSession, nextScreen, startTimerOnFirstInput } from './app-state';
import { createInitialStats } from '../engine/stats-base';
import type { Language, RunConfig, RunSession, Snippet } from '../types';

const createSession = (language: Language, content: string, currentIndex: number): RunSession => {
  const config: RunConfig = {
    durationMs: 300000,
    language,
    difficulty: 'easy',
    soundEnabled: false
  };

  const snippet: Snippet = {
    id: 'test',
    language,
    difficulty: 'easy',
    title: 'test',
    content,
    tags: []
  };

  const now = Date.now();

  return {
    config,
    stats: createInitialStats(),
    currentSnippet: snippet,
    currentIndex,
    timeRemainingMs: config.durationMs,
    isFocused: true,
    queueOfNextSnippets: [],
    recentSnippetIds: [],
    mistakesByIndex: {},
    startedAt: now,
    lastTickAt: now,
    feedbackMessage: '',
    lastFeedbackMinute: 0
  };
};

describe('app state input mapping', () => {
  it('uses space to cross newline in english mode', () => {
    const session = createSession('english', 'a\nb', 1);
    const next = applyInputToSession(session, ' ', Date.now());
    expect(next.currentIndex).toBe(2);
  });

  it('keeps enter for code mode newline input', () => {
    const session = createSession('javascript', 'a\nb', 1);
    const next = applyInputToSession(session, 'Enter', Date.now());
    expect(next.currentIndex).toBe(2);
  });
});

describe('app state pause control key', () => {
  it('switches playing to paused on escape', () => {
    const session = createSession('javascript', 'abc', 1);
    const result = applyControlKey('playing', session, 'Escape', 12345);
    expect(result.handled).toBe(true);
    expect(result.screen).toBe(nextScreen('playing', 'PAUSE'));
    expect(result.session?.currentIndex).toBe(1);
  });

  it('switches paused to playing on escape and refreshes tick time', () => {
    const session = createSession('javascript', 'abc', 1);
    const result = applyControlKey('paused', session, 'Escape', 99999);
    expect(result.handled).toBe(true);
    expect(result.screen).toBe(nextScreen('paused', 'RESUME'));
    expect(result.session?.lastTickAt).toBe(99999);
  });

  it('ignores non-escape keys while paused', () => {
    const session = createSession('javascript', 'abc', 1);
    const result = applyControlKey('paused', session, 'a', 99999);
    expect(result.handled).toBe(false);
    expect(result.screen).toBe('paused');
    expect(result.session?.currentIndex).toBe(1);
  });

  it('ignores escape outside playing or paused', () => {
    const session = createSession('javascript', 'abc', 1);
    const menuResult = applyControlKey('menu', session, 'Escape', 123);
    const countdownResult = applyControlKey('countdown', session, 'Escape', 123);
    const resultResult = applyControlKey('result', session, 'Escape', 123);

    expect(menuResult.handled).toBe(false);
    expect(menuResult.screen).toBe('menu');
    expect(countdownResult.handled).toBe(false);
    expect(countdownResult.screen).toBe('countdown');
    expect(resultResult.handled).toBe(false);
    expect(resultResult.screen).toBe('result');
  });
});

describe('app state timer arming', () => {
  it('starts timer timestamp at first typed character', () => {
    const previous = createSession('javascript', 'abc', 0);
    const next = applyInputToSession(previous, 'a', 1234);
    const armed = startTimerOnFirstInput(previous, next, 1234);
    expect(armed.lastTickAt).toBe(1234);
    expect(armed.startedAt).toBe(1234);
  });

  it('does not start timer on backspace-only input', () => {
    const previous = createSession('javascript', 'abc', 0);
    const next = applyInputToSession(previous, 'Backspace', 2000);
    const armed = startTimerOnFirstInput(previous, next, 2000);
    expect(armed.lastTickAt).toBe(previous.lastTickAt);
    expect(armed.startedAt).toBe(previous.startedAt);
  });
});
