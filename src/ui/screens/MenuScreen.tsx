import { useMemo, useState } from 'react';
import type { MenuScoreSummary } from '../../storage/record-aggregator';
import type { AppSettings } from '../../storage/settings-store';
import type { RunConfig } from '../../types';
import { formatEnglishTimestamp } from '../formatters/date-time';

type MenuScreenProps = {
  settings: AppSettings;
  scoreSummary: MenuScoreSummary;
  onChangeSettings: (next: AppSettings) => void;
  onSaveSettings: (next: AppSettings) => void;
  onStart: (config: RunConfig) => void;
};

type DurationMode = 'preset' | 'custom';

const PRESET_DURATIONS = [300000, 600000] as const;
const DEFAULT_CUSTOM_DURATION_MS = 900000;
const MIN_CUSTOM_MINUTES = 1;
const MAX_CUSTOM_MINUTES = 60;

const inferDurationMode = (durationMs: number): DurationMode =>
  PRESET_DURATIONS.includes(durationMs as (typeof PRESET_DURATIONS)[number]) ? 'preset' : 'custom';

const clampMinutes = (minutes: number): number => Math.max(MIN_CUSTOM_MINUTES, Math.min(MAX_CUSTOM_MINUTES, minutes));

const toMinutes = (durationMs: number): number => clampMinutes(Math.round(durationMs / 60000));

export const MenuScreen = ({ settings, scoreSummary, onChangeSettings, onSaveSettings, onStart }: MenuScreenProps) => {
  const [durationMode, setDurationMode] = useState<DurationMode>(() => inferDurationMode(settings.defaultDurationMs));
  const customMinutes = toMinutes(settings.defaultDurationMs);

  const runConfig = useMemo(
    () => ({
      durationMs: settings.defaultDurationMs,
      language: settings.defaultLanguage,
      difficulty: settings.defaultDifficulty,
      soundEnabled: settings.soundEnabled
    }),
    [settings]
  );

  return (
    <section className="menu-screen">
      <section className="card menu-form-card">
        <h1>Typing Rush</h1>
        <p>Code and English article typing practice.</p>

        <label>
          Duration
          <select
            value={durationMode === 'custom' ? 'custom' : String(settings.defaultDurationMs)}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'custom') {
                setDurationMode('custom');
                const nextDuration = inferDurationMode(settings.defaultDurationMs) === 'preset'
                  ? DEFAULT_CUSTOM_DURATION_MS
                  : settings.defaultDurationMs;
                onChangeSettings({ ...settings, defaultDurationMs: nextDuration });
                return;
              }

              setDurationMode('preset');
              onChangeSettings({ ...settings, defaultDurationMs: Number(value) });
            }}
          >
            <option value={300000}>5 minutes</option>
            <option value={600000}>10 minutes</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        {durationMode === 'custom' ? (
          <label>
            Custom Minutes (1-60)
            <div className="minutes-control">
              <input
                className="theme-control minutes-input"
                type="number"
                min={MIN_CUSTOM_MINUTES}
                max={MAX_CUSTOM_MINUTES}
                value={customMinutes}
                onChange={(event) => {
                  const minutes = clampMinutes(Number(event.target.value) || MIN_CUSTOM_MINUTES);
                  onChangeSettings({ ...settings, defaultDurationMs: minutes * 60000 });
                }}
              />
              <div className="minutes-stepper" role="group" aria-label="Adjust custom minutes">
                <button
                  type="button"
                  className="button-secondary minutes-step-btn"
                  aria-label="Increase custom minutes"
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      defaultDurationMs: clampMinutes(customMinutes + 1) * 60000
                    })
                  }
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="button-secondary minutes-step-btn"
                  aria-label="Decrease custom minutes"
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      defaultDurationMs: clampMinutes(customMinutes - 1) * 60000
                    })
                  }
                >
                  ▼
                </button>
              </div>
            </div>
          </label>
        ) : null}

        <label>
          Language
          <select
            value={settings.defaultLanguage}
            onChange={(event) =>
              onChangeSettings({ ...settings, defaultLanguage: event.target.value as AppSettings['defaultLanguage'] })
            }
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
            value={settings.defaultDifficulty}
            onChange={(event) =>
              onChangeSettings({ ...settings, defaultDifficulty: event.target.value as AppSettings['defaultDifficulty'] })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="inline">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => onChangeSettings({ ...settings, soundEnabled: event.target.checked })}
          />
          Sound enabled
        </label>

        <div className="row">
          <button
            onClick={() => {
              onSaveSettings(settings);
              onStart(runConfig);
            }}
          >
            Start Run
          </button>
        </div>
      </section>

      <section className="card menu-score-card" aria-label="Performance Summary">
        <h2>Performance Summary</h2>
        {scoreSummary.hasRecords && scoreSummary.bestRecord && scoreSummary.recentAverage ? (
          <>
            <section className="menu-score-section">
              <h3>Best Record</h3>
              <div className="menu-score-best">
                <div>
                  <span>Completed At</span>
                  <strong className="menu-timestamp">{formatEnglishTimestamp(scoreSummary.bestRecord.finishedAt)}</strong>
                </div>
                <div>
                  <span>KPM</span>
                  <strong>{scoreSummary.bestRecord.stats.lpm}</strong>
                </div>
                <div>
                  <span>Accuracy</span>
                  <strong>{scoreSummary.bestRecord.stats.accuracy}%</strong>
                </div>
              </div>
            </section>

            <section className="menu-score-section">
              <h3>Recent Average</h3>
              <div className="menu-score-average">
                <div>
                  <span>KPM</span>
                  <strong>{scoreSummary.recentAverage.lpm}</strong>
                </div>
                <div>
                  <span>Accuracy</span>
                  <strong>{scoreSummary.recentAverage.accuracy}%</strong>
                </div>
              </div>
            </section>

            <section className="menu-score-section">
              <h3>Recent Records</h3>
              <ul className="menu-score-list">
                {scoreSummary.recentRecords.map((record) => (
                  <li key={record.id}>
                    <span className="menu-timestamp">{formatEnglishTimestamp(record.finishedAt)}</span>
                    <span>KPM {record.stats.lpm}</span>
                    <span>Acc {record.stats.accuracy}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <p className="menu-score-empty">No records yet for this language and difficulty.</p>
        )}
      </section>
    </section>
  );
};
