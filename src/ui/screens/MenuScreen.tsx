import { useMemo, useState } from 'react';
import type { AppSettings } from '../../storage/settings-store';
import type { RunConfig } from '../../types';

type MenuScreenProps = {
  settings: AppSettings;
  onSaveSettings: (next: AppSettings) => void;
  onStart: (config: RunConfig) => void;
};

export const MenuScreen = ({ settings, onSaveSettings, onStart }: MenuScreenProps) => {
  const [draft, setDraft] = useState<AppSettings>(settings);

  const runConfig = useMemo(
    () => ({
      durationMs: draft.defaultDurationMs,
      language: draft.defaultLanguage,
      difficulty: draft.defaultDifficulty,
      soundEnabled: draft.soundEnabled
    }),
    [draft]
  );

  return (
    <section className="menu-screen card">
      <h1>Typing Rush</h1>
      <p>Code and English article typing practice.</p>

      <label>
        Duration
        <select
          value={draft.defaultDurationMs}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, defaultDurationMs: Number(event.target.value) as AppSettings['defaultDurationMs'] }))
          }
        >
          <option value={300000}>5 minutes</option>
          <option value={600000}>10 minutes</option>
        </select>
      </label>

      <label>
        Language
        <select
          value={draft.defaultLanguage}
          onChange={(event) => setDraft((prev) => ({ ...prev, defaultLanguage: event.target.value as AppSettings['defaultLanguage'] }))}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="english">English</option>
        </select>
      </label>

      <label>
        Difficulty
        <select
          value={draft.defaultDifficulty}
          onChange={(event) => setDraft((prev) => ({ ...prev, defaultDifficulty: event.target.value as AppSettings['defaultDifficulty'] }))}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <label className="inline">
        <input
          type="checkbox"
          checked={draft.soundEnabled}
          onChange={(event) => setDraft((prev) => ({ ...prev, soundEnabled: event.target.checked }))}
        />
        Sound enabled
      </label>

      <div className="row">
        <button
          onClick={() => {
            onSaveSettings(draft);
            onStart(runConfig);
          }}
        >
          Start Run
        </button>
      </div>
    </section>
  );
};

