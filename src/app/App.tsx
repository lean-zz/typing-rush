import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import './styles.css';
import { aggregateBestResults, aggregateMenuScoreSummary } from '../storage/record-aggregator';
import { appendResult, loadResults } from '../storage/results-store';
import { defaultSettings, loadSettings, saveSettings, toRunConfig, type AppSettings } from '../storage/settings-store';
import { nextScreen, createRunSession, applyInputToSession, startTimerOnFirstInput, tickSession, applyControlKey } from './app-state';
import type { ResultRecord, RunConfig, RunSession, RunStats } from '../types';
import { MenuScreen } from '../ui/screens/MenuScreen';
import { GameScreen } from '../ui/screens/GameScreen';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { playSound } from '../ui/sound';

type AppState = {
  screen: 'menu' | 'countdown' | 'playing' | 'paused' | 'result';
  countdown: number;
  settings: AppSettings;
  menuDraft: AppSettings;
  session: RunSession | null;
  currentRunId: string | null;
  pendingResult: { runId: string; config: RunConfig; stats: RunStats } | null;
  latestResult: ResultRecord | null;
  history: ResultRecord[];
};

const initialState = (): AppState => {
  const settings = typeof localStorage === 'undefined' ? defaultSettings : loadSettings();
  const history = typeof localStorage === 'undefined' ? [] : loadResults();
  return {
    screen: 'menu',
    countdown: 3,
    settings,
    menuDraft: settings,
    session: null,
    currentRunId: null,
    pendingResult: null,
    latestResult: null,
    history
  };
};

export const App = () => {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    if (state.screen !== 'playing' || !state.session) {
      return;
    }

    const timer = window.setInterval(() => {
      setState((prev) => {
        if (prev.screen !== 'playing' || !prev.session) {
          return prev;
        }

        if (prev.session.stats.totalTypedChars <= 0) {
          return prev;
        }

        const ticked = tickSession(prev.session, Date.now());
        if (!ticked.finished) {
          return { ...prev, session: ticked.session };
        }

        return {
          ...prev,
          session: ticked.session,
          pendingResult:
            prev.currentRunId === null
              ? null
              : {
                  runId: prev.currentRunId,
                  config: ticked.session.config,
                  stats: ticked.session.stats
                },
          screen: nextScreen(prev.screen, 'FINISH')
        };
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [state.screen, state.session]);

  useEffect(() => {
    if (!state.pendingResult) {
      return;
    }

    playSound(state.settings.soundEnabled, 'finish');
    const record = appendResult(state.pendingResult.config, state.pendingResult.stats);
    const history = loadResults();
    const runId = state.pendingResult.runId;

    setState((prev) => {
      if (!prev.pendingResult || prev.pendingResult.runId !== runId) {
        return prev;
      }

      return {
        ...prev,
        latestResult: record,
        history,
        pendingResult: null
      };
    });
  }, [state.pendingResult, state.settings.soundEnabled]);

  useEffect(() => {
    const onBlur = () => {
      setState((prev) => {
        if (prev.screen !== 'playing' || !prev.session) {
          return prev;
        }

        return {
          ...prev,
          screen: nextScreen(prev.screen, 'PAUSE'),
          session: { ...prev.session, isFocused: false }
        };
      });
    };

    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  const best = useMemo(() => aggregateBestResults(state.history), [state.history]);
  const menuScoreSummary = useMemo(
    () => aggregateMenuScoreSummary(state.history, toRunConfig(state.menuDraft)),
    [state.history, state.menuDraft]
  );

  const handleStart = (config: RunConfig) => {
    const now = Date.now();
    const runId = crypto.randomUUID();
    playSound(state.menuDraft.soundEnabled, 'start');
    setState((prev) => ({
      ...prev,
      screen: 'playing',
      countdown: 3,
      session: createRunSession(config, now),
      currentRunId: runId,
      pendingResult: null,
      latestResult: null
    }));
  };

  const handleSaveSettings = (settings: AppSettings) => {
    saveSettings(settings);
    setState((prev) => ({ ...prev, settings, menuDraft: settings }));
  };

  const handleInput = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!state.session || (state.screen !== 'playing' && state.screen !== 'paused')) {
      return;
    }

    const controlResult = applyControlKey(state.screen, state.session, event.key, Date.now());
    if (controlResult.handled) {
      event.preventDefault();
      setState((prev) => ({
        ...prev,
        screen: controlResult.screen,
        session: controlResult.session
      }));
      return;
    }

    const isEnglishMode = state.session.config.language === 'english';
    const allowed =
      event.key.length === 1 || event.key === 'Backspace' || event.key === 'Tab' || (!isEnglishMode && event.key === 'Enter');
    if (!allowed) {
      return;
    }

    event.preventDefault();

    if (state.screen === 'paused') {
      return;
    }

    const inputAt = Date.now();
    const beforeWrong = state.session.stats.wrongChars;
    const nextSession = applyInputToSession(state.session, event.key, inputAt);
    const sessionWithTimer = startTimerOnFirstInput(state.session, nextSession, inputAt);

    if (event.key === 'Backspace') {
      return setState((prev) => ({ ...prev, session: sessionWithTimer }));
    }

    const soundType = sessionWithTimer.stats.wrongChars > beforeWrong ? 'error' : 'hit';
    playSound(state.settings.soundEnabled, soundType);

    setState((prev) => ({ ...prev, session: sessionWithTimer }));
  };

  const handleResume = () => {
    setState((prev) => {
      if (prev.screen !== 'paused' || !prev.session) {
        return prev;
      }

      return {
        ...prev,
        screen: nextScreen(prev.screen, 'RESUME'),
        session: { ...prev.session, isFocused: true, lastTickAt: Date.now() }
      };
    });
  };

  const handleBackToMenu = () => {
    setState((prev) => ({
      ...prev,
      screen: 'menu',
      menuDraft: prev.settings,
      session: null,
      currentRunId: null,
      pendingResult: null,
      countdown: 3,
      history: loadResults()
    }));
  };

  return (
    <main className="app-shell">
      {state.screen === 'menu' ? (
        <MenuScreen
          settings={state.menuDraft}
          scoreSummary={menuScoreSummary}
          onChangeSettings={(settings) => setState((prev) => ({ ...prev, menuDraft: settings }))}
          onSaveSettings={handleSaveSettings}
          onStart={handleStart}
        />
      ) : null}

      {(state.screen === 'playing' || state.screen === 'paused') && state.session ? (
        <GameScreen
          session={state.session}
          paused={state.screen === 'paused'}
          onInput={handleInput}
          onResume={handleResume}
          onBackToMenu={handleBackToMenu}
        />
      ) : null}

      {state.screen === 'result' && state.session ? (
        <ResultScreen
          stats={state.session.stats}
          history={state.history}
          best={best}
          onBackToMenu={handleBackToMenu}
        />
      ) : null}
    </main>
  );
};

export default App;
