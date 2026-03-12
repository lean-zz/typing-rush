let audioCtx: AudioContext | null = null;

const beep = (frequency: number, durationMs: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  audioCtx ??= new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.03;

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + durationMs / 1000);
};

export const playSound = (enabled: boolean, type: 'hit' | 'error' | 'start' | 'finish'): void => {
  if (!enabled) {
    return;
  }

  if (type === 'hit') beep(420, 30);
  if (type === 'error') beep(220, 80);
  if (type === 'start') beep(680, 100);
  if (type === 'finish') beep(180, 220);
};
