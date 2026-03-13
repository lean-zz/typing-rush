import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { RunSession } from '../../types';
import { drawPractice } from '../../render/canvas-renderer';
import { TopBar } from '../components/TopBar';
import { HudPanel } from '../components/HudPanel';
import { PauseOverlay } from '../components/PauseOverlay';
import { BottomHint } from '../components/BottomHint';

type GameScreenProps = {
  session: RunSession;
  paused: boolean;
  onInput: (event: KeyboardEvent<HTMLDivElement>) => void;
  onResume: () => void;
};

export const GameScreen = ({ session, paused, onInput, onResume }: GameScreenProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    rootRef.current?.focus();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawPractice({
      canvas,
      snippet: session.currentSnippet,
      currentIndex: session.currentIndex,
      mistakesByIndex: session.mistakesByIndex
    });
  }, [session]);

  return (
    <section className="game-screen">
      <TopBar config={session.config} />
      <div className="game-layout" ref={rootRef} tabIndex={0} onKeyDown={onInput}>
        <canvas className="practice-canvas" ref={canvasRef} />
        <HudPanel stats={session.stats} timeRemainingMs={session.timeRemainingMs} />
        {paused ? <PauseOverlay onResume={onResume} /> : null}
      </div>
      <BottomHint message={session.feedbackMessage} tags={session.currentSnippet.tags} />
    </section>
  );
};

