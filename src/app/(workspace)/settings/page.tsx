"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Field, Input, Select } from "@/components/ui/form";

interface UserSettings {
  Theme?: string;
  Language?: string;
  DefaultPlaybackSpeed?: number;
  AutoPlay?: boolean;
  ReducedMotion?: boolean;
  SoundEnabled?: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  Theme: "DARK",
  Language: "en",
  DefaultPlaybackSpeed: 1,
  AutoPlay: false,
  ReducedMotion: false,
  SoundEnabled: true,
};

const LOCAL_STORAGE_KEY = "logiclab:settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  useEffect(() => {
    // Attempt to load settings from server or fall back to local storage
    fetch("/api/settings")
      .then(async (response) => {
        if (response.ok) {
          const remote = (await response.json()) as UserSettings & {
            authenticated?: boolean;
          };
          if (remote.authenticated === false) {
            setIsAuthenticated(false);
            try {
              const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (cached) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
              }
            } catch {
              // Keep default settings
            }
          } else {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...remote,
              Theme: remote.Theme ?? "DARK",
            });
            setIsAuthenticated(true);
          }
        } else {
          // Server unavailable; load from localStorage
          setIsAuthenticated(false);
          try {
            const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cached) {
              setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
            }
          } catch {
            // Keep default settings
          }
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
          }
        } catch {
          // Keep default settings
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setStatusMessage(null);

    // Save locally first
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore local storage quota errors
    }

    // Apply reduced motion preference dynamically if toggled
    if (typeof document !== "undefined") {
      if (settings.ReducedMotion) {
        document.documentElement.dataset.reducedMotion = "true";
      } else {
        delete document.documentElement.dataset.reducedMotion;
      }
    }

    if (isAuthenticated) {
      try {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: settings.Theme ?? "DARK",
            language: settings.Language ?? "en",
            defaultPlaybackSpeed: settings.DefaultPlaybackSpeed ?? 1,
            autoPlay: Boolean(settings.AutoPlay),
            reducedMotion: Boolean(settings.ReducedMotion),
            soundEnabled: Boolean(settings.SoundEnabled),
          }),
        });
        if (response.ok) {
          setStatusMessage({ text: "Preferences saved and synced to your account." });
        } else {
          setStatusMessage({ text: "Unable to sync with server. Saved locally.", isError: true });
        }
      } catch {
        setStatusMessage({ text: "Saved locally. Server sync unavailable.", isError: true });
      }
    } else {
      setStatusMessage({
        text: "Preferences saved locally in your browser. Sign in to sync across devices.",
      });
    }
  };

  if (loading) {
    return (
      <main className="page-content">
        <header className="page-header">
          <div>
            <span className="page-header__eyebrow">Preferences</span>
            <h1>Settings</h1>
            <p>Loading application preferences…</p>
          </div>
        </header>
        <div className="card">
          <p className="text-muted">Loading configuration…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Laboratory Preferences</span>
          <h1>Application Settings</h1>
          <p>
            Configure playback speeds, motion safety, and workspace defaults. Your preferences
            follow you across sessions.
          </p>
        </div>
      </header>

      {!isAuthenticated && (
        <div className="card settings-sync-notice">
          <span className="badge badge--subtle">Local Session</span>
          <p className="text-caption text-muted">
            You are browsing as a guest. Settings are saved locally.{" "}
            <Link href="/login" className="link-highlight">
              Sign in
            </Link>{" "}
            to sync preferences across all your devices.
          </p>
        </div>
      )}

      <section className="card settings-form-card" aria-label="Settings configuration form">
        <div className="card__header">
          <h2>Appearance & Interaction</h2>
          <span className="text-caption text-muted">
            Core visualizer controls and accessibility
          </span>
        </div>

        <div className="settings-fields-grid">
          <Field
            label="Theme"
            hint="LogicLab is locked to the approved high-contrast dark laboratory design system."
          >
            <Select
              value={settings.Theme}
              onChange={(e) => setSettings({ ...settings, Theme: e.target.value })}
            >
              <option value="DARK">DARK (Production Dark UI)</option>
              <option value="SYSTEM">SYSTEM (Dark High Contrast)</option>
            </Select>
          </Field>

          <Field label="Interface Language">
            <Input
              value={settings.Language ?? "en"}
              onChange={(e) => setSettings({ ...settings, Language: e.target.value })}
              maxLength={10}
            />
          </Field>

          <Field
            label="Default Playback Speed (x)"
            hint="Controls the default pace of algorithm visualizer animations (0.25x to 4.0x)."
          >
            <Input
              type="number"
              min="0.25"
              max="4"
              step="0.25"
              value={settings.DefaultPlaybackSpeed ?? 1}
              onChange={(e) =>
                setSettings({ ...settings, DefaultPlaybackSpeed: Number(e.target.value) })
              }
            />
          </Field>
        </div>

        <div className="settings-toggles-section">
          <h3>Accessibility & Audio</h3>
          <div className="settings-toggle-list">
            <label className="settings-toggle-item">
              <input
                type="checkbox"
                checked={Boolean(settings.ReducedMotion)}
                onChange={(e) => setSettings({ ...settings, ReducedMotion: e.target.checked })}
              />
              <div className="settings-toggle-text">
                <strong>Reduced Motion</strong>
                <span className="text-caption text-muted">
                  Suppresses non-essential transitions and ambient pulses across all visualizer
                  canvases.
                </span>
              </div>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                checked={Boolean(settings.AutoPlay)}
                onChange={(e) => setSettings({ ...settings, AutoPlay: e.target.checked })}
              />
              <div className="settings-toggle-text">
                <strong>Autoplay Visualizers</strong>
                <span className="text-caption text-muted">
                  Automatically start algorithm playback when opening a visualization canvas.
                </span>
              </div>
            </label>

            <label className="settings-toggle-item">
              <input
                type="checkbox"
                checked={Boolean(settings.SoundEnabled)}
                onChange={(e) => setSettings({ ...settings, SoundEnabled: e.target.checked })}
              />
              <div className="settings-toggle-text">
                <strong>Auditory Step Feedback</strong>
                <span className="text-caption text-muted">
                  Enable subtle auditory cues during algorithm comparison and step transitions.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-actions-row">
          <button type="button" className="button button--primary" onClick={handleSave}>
            Save Preferences
          </button>
        </div>

        {statusMessage && (
          <div
            className={`status-message ${statusMessage.isError ? "status-message--error" : "status-message--success"}`}
            role="status"
          >
            {statusMessage.text}
          </div>
        )}
      </section>
    </main>
  );
}
