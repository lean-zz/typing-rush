import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('../ui/sound', () => ({
  playSound: vi.fn()
}));

const seedResults = () => {
  localStorage.setItem(
    'typing-rush:results',
    JSON.stringify([
      {
        id: 'ts-easy-best',
        finishedAt: '2026-03-13T10:05:00.000Z',
        config: {
          durationMs: 300000,
          language: 'typescript',
          difficulty: 'easy',
          soundEnabled: true
        },
        stats: {
          totalTypedChars: 100,
          correctChars: 95,
          wrongChars: 5,
          backspaceCount: 0,
          rawLpm: 28,
          lpm: 24,
          accuracy: 95,
          combo: 0,
          maxCombo: 12,
          completedSnippets: 3,
          lastInputAt: null,
          longPauseCount: 0
        }
      },
      {
        id: 'ts-easy-recent',
        finishedAt: '2026-03-13T10:00:00.000Z',
        config: {
          durationMs: 300000,
          language: 'typescript',
          difficulty: 'easy',
          soundEnabled: true
        },
        stats: {
          totalTypedChars: 80,
          correctChars: 72,
          wrongChars: 8,
          backspaceCount: 0,
          rawLpm: 24,
          lpm: 20,
          accuracy: 90,
          combo: 0,
          maxCombo: 9,
          completedSnippets: 2,
          lastInputAt: null,
          longPauseCount: 0
        }
      },
      {
        id: 'py-hard',
        finishedAt: '2026-03-13T09:55:00.000Z',
        config: {
          durationMs: 300000,
          language: 'python',
          difficulty: 'hard',
          soundEnabled: true
        },
        stats: {
          totalTypedChars: 90,
          correctChars: 79,
          wrongChars: 11,
          backspaceCount: 0,
          rawLpm: 20,
          lpm: 17,
          accuracy: 87,
          combo: 0,
          maxCombo: 7,
          completedSnippets: 2,
          lastInputAt: null,
          longPauseCount: 0
        }
      }
    ])
  );
};

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('can end a run early and return to menu from game screen', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Menu' }));

    expect(screen.getByRole('heading', { name: 'Typing Rush' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Run' })).toBeInTheDocument();
  });

  it('shows language and difficulty summary independent of duration without score', () => {
    seedResults();
    render(<App />);

    const summary = screen.getAllByRole('region', { name: 'Performance Summary' })[0];
    expect(within(summary).queryByText(/Score/i)).not.toBeInTheDocument();
    expect(within(summary).getByText('KPM 24')).toBeInTheDocument();
    expect(within(summary).getByText('Acc 95%')).toBeInTheDocument();
    expect(within(summary).getByText('KPM 20')).toBeInTheDocument();
    expect(within(summary).getByText('Acc 90%')).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText('Duration')[0], { target: { value: '600000' } });

    expect(within(summary).getByText('KPM 24')).toBeInTheDocument();
    expect(within(summary).getByText('Acc 95%')).toBeInTheDocument();
  });

  it('shows custom duration selector when custom minutes equals 5 and keeps custom selected', () => {
    render(<App />);

    const durationSelect = screen.getAllByLabelText('Duration')[0] as HTMLSelectElement;
    fireEvent.change(durationSelect, { target: { value: 'custom' } });

    const customMinutesInput = screen.getByLabelText('Custom Minutes (1-60)') as HTMLInputElement;
    fireEvent.change(customMinutesInput, { target: { value: '5' } });

    expect(durationSelect.value).toBe('custom');
    expect(screen.getByLabelText('Custom Minutes (1-60)')).toBeInTheDocument();
  });

  it('adjusts custom minutes with themed stepper and enforces 1-60 limits', () => {
    render(<App />);

    const durationSelect = screen.getAllByLabelText('Duration')[0] as HTMLSelectElement;
    fireEvent.change(durationSelect, { target: { value: 'custom' } });

    const customMinutesInput = screen.getByLabelText('Custom Minutes (1-60)') as HTMLInputElement;
    const increaseButton = screen.getByRole('button', { name: 'Increase custom minutes' });
    const decreaseButton = screen.getByRole('button', { name: 'Decrease custom minutes' });

    expect(customMinutesInput.value).toBe('15');

    fireEvent.click(increaseButton);
    expect(customMinutesInput.value).toBe('16');

    fireEvent.change(customMinutesInput, { target: { value: '60' } });
    fireEvent.click(increaseButton);
    expect(customMinutesInput.value).toBe('60');

    fireEvent.change(customMinutesInput, { target: { value: '1' } });
    fireEvent.click(decreaseButton);
    expect(customMinutesInput.value).toBe('1');
  });

  it('shows result header back button and returns to menu from run complete', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-13T10:00:00.000Z'));
    render(<App />);

    const durationSelect = screen.getAllByLabelText('Duration')[0] as HTMLSelectElement;
    fireEvent.change(durationSelect, { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('Custom Minutes (1-60)'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }));
    const gameLayout = document.querySelector('.game-layout');
    if (!gameLayout) {
      throw new Error('Expected game layout to exist.');
    }

    fireEvent.keyDown(gameLayout, { key: 'a' });

    vi.setSystemTime(new Date('2026-03-13T10:01:01.000Z'));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Back to Menu' }));
    expect(screen.getByRole('heading', { name: 'Typing Rush' })).toBeInTheDocument();
  });

  it('persists one record only once when run finishes in StrictMode', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-13T10:00:00.000Z'));

    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    const durationSelect = screen.getAllByLabelText('Duration')[0] as HTMLSelectElement;
    fireEvent.change(durationSelect, { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('Custom Minutes (1-60)'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Start Run' }));
    const gameLayout = document.querySelector('.game-layout');
    if (!gameLayout) {
      throw new Error('Expected game layout to exist.');
    }

    fireEvent.keyDown(gameLayout, { key: 'a' });

    vi.setSystemTime(new Date('2026-03-13T10:01:01.000Z'));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const results = JSON.parse(localStorage.getItem('typing-rush:results') ?? '[]') as unknown[];
    expect(results).toHaveLength(1);
  });

  it('shows an empty state when no records match selected language and difficulty', () => {
    seedResults();
    render(<App />);

    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'python' } });
    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'easy' } });

    expect(screen.getByText('No records yet for this language and difficulty.')).toBeInTheDocument();
  });
});
