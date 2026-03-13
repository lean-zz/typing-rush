import type { AppScreen } from '../types';

export type AppState = {
  screen: AppScreen;
};

export type AppEvent =
  | { type: 'GO_MENU' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'COUNTDOWN_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'FINISH' };

export const transition = (state: AppState, event: AppEvent): AppState => {
  switch (event.type) {
    case 'GO_MENU':
      return { screen: 'menu' };
    case 'START_COUNTDOWN':
      return { screen: 'countdown' };
    case 'COUNTDOWN_DONE':
      return state.screen === 'countdown' ? { screen: 'playing' } : state;
    case 'PAUSE':
      return state.screen === 'playing' ? { screen: 'paused' } : state;
    case 'RESUME':
      return state.screen === 'paused' ? { screen: 'playing' } : state;
    case 'FINISH':
      return { screen: 'result' };
    default:
      return state;
  }
};

