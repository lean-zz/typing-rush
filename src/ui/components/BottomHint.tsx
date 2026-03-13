type BottomHintProps = {
  message: string;
  tags: string[];
};

export const BottomHint = ({ message, tags }: BottomHintProps) => (
  <footer className="bottom-hint">
    <span>{message || 'Focus steady. Backspace is allowed, mistakes still count.'}</span>
    <span>{tags.join(' · ')}</span>
  </footer>
);

