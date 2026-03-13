import type { RunConfig } from '../../types';

type TopBarProps = {
  config: RunConfig;
  onBackToMenu: () => void;
};

const formatDuration = (durationMs: number): string => {
  const minutes = Math.round(durationMs / 60000);
  return `${minutes}m`;
};

export const TopBar = ({ config, onBackToMenu }: TopBarProps) => (
  <header className="top-bar">
    <div className="top-bar-meta">
      <span>{formatDuration(config.durationMs)}</span>
      <span>{config.language}</span>
      <span>{config.difficulty}</span>
      <span>{config.soundEnabled ? 'sound:on' : 'sound:off'}</span>
    </div>
    <button type="button" className="top-bar-menu-btn" onClick={onBackToMenu}>
      Back to Menu
    </button>
  </header>
);
