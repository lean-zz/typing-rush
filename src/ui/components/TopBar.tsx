import type { RunConfig } from '../../types';

type TopBarProps = {
  config: RunConfig;
};

export const TopBar = ({ config }: TopBarProps) => (
  <header className="top-bar">
    <span>{config.durationMs === 300000 ? '5m' : '10m'}</span>
    <span>{config.language}</span>
    <span>{config.difficulty}</span>
    <span>{config.soundEnabled ? 'sound:on' : 'sound:off'}</span>
  </header>
);
