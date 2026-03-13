type PauseOverlayProps = {
  onResume: () => void;
};

export const PauseOverlay = ({ onResume }: PauseOverlayProps) => (
  <div className="pause-overlay" onClick={onResume} role="button" tabIndex={0}>
    <div>
      <strong>Paused</strong>
      <p>Click or press Esc to continue</p>
    </div>
  </div>
);

