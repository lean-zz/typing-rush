import { describe, expect, it } from 'vitest';
import { transition } from './state-machine';

describe('state machine', () => {
  it('moves countdown to playing', () => {
    const state = transition({ screen: 'countdown' }, { type: 'COUNTDOWN_DONE' });
    expect(state.screen).toBe('playing');
  });

  it('pauses only during playing', () => {
    const paused = transition({ screen: 'playing' }, { type: 'PAUSE' });
    const ignored = transition({ screen: 'menu' }, { type: 'PAUSE' });
    expect(paused.screen).toBe('paused');
    expect(ignored.screen).toBe('menu');
  });
});
