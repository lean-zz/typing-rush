import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import './styles.css';
import { aggregateBestResults } from '../storage/record-aggregator';
import { appendResult, loadResults } from '../storage/results-store';
import { defaultSettings, loadSettings, saveSettings, type AppSettings } from '../storage/settings-store';
import { nextScreen, createRunSession, applyInputToSession, startTimerOnFirstInput, tickSession, applyControlKey } from './app-state';
import type { ResultRecord, RunConfig, RunSession } from '../types';
import { MenuScreen } from '../ui/screens/MenuScreen';
import { GameScreen } from '../ui/screens/GameScreen';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { playSound } from '../ui/sound';

type AppState = {
  screen: 'menu' | 'countdown' | 'playing' | 'paused' | 'result';
  countdown: number;
  settings: AppSettings;
  session: RunSession | null;
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
    session: null,
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

        playSound(prev.settings.soundEnabled, 'finish');
        const record = appendResult(ticked.session.config, ticked.session.stats);
        const history = loadResults();

        return {
          ...prev,
          session: ticked.session,
          latestResult: record,
          history,
          screen: nextScreen(prev.screen, 'FINISH')
        };
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [state.screen, state.session]);

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

  const handleStart = (config: RunConfig) => {
    const now = Date.now();
    playSound(state.settings.soundEnabled, 'start');
    setState((prev) => ({
      ...prev,
      screen: 'playing',
      countdown: 3,
      session: createRunSession(config, now)
    }));
  };

  const handleSaveSettings = (settings: AppSettings) => {
    saveSettings(settings);
    setState((prev) => ({ ...prev, settings }));
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
      session: null,
      countdown: 3,
      history: loadResults()
    }));
  };

  return (
    <main className="app-shell">
      {state.screen === 'menu' ? (
        <MenuScreen settings={state.settings} onSaveSettings={handleSaveSettings} onStart={handleStart} />
      ) : null}

      {(state.screen === 'playing' || state.screen === 'paused') && state.session ? (
        <GameScreen session={state.session} paused={state.screen === 'paused'} onInput={handleInput} onResume={handleResume} />
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


