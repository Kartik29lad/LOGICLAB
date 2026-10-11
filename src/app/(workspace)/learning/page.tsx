"use client";

import { useEffect, useState } from "react";

type Path = {
  Slug: string;
  DisplayName: string;
  Status: string;
  CompletionPercent: number;
  ItemsCompleted: number;
  locked: boolean;
  prerequisites: string[];
};
type Achievement = {
  AchievementCode: string;
  Name: string;
  Description: string;
  Category: string;
  EarnedAt: string | null;
};
export default function LearningPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([fetch("/api/learning-paths"), fetch("/api/achievements")])
      .then(async ([p, a]) => {
        const pd = await p.json();
        const ad = await a.json();
        if (pd.error || ad.error)
          setError(pd.error?.message ?? ad.error?.message ?? "Unable to load learning data.");
        else {
          setPaths(pd.paths ?? []);
          setAchievements(ad.achievements ?? []);
        }
      })
      .catch(() => setError("Unable to load learning data."));
  }, []);
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Learning</span>
          <h1>Learning Paths</h1>
          <p>Follow structured progress and collect achievements as concepts become complete.</p>
        </div>
      </header>
      {error ? (
        <section className="card">
          <p>
            {error} <a href="/login">Sign in</a>
          </p>
        </section>
      ) : (
        <>
          <section>
            <h2>Paths</h2>
            <div className="metric-grid">
              {paths.map((path) => (
                <article className="card" key={path.Slug}>
                  <h3>{path.DisplayName}</h3>
                  <p>{path.Status.replace("_", " ")}</p>
                  <strong>{path.CompletionPercent}%</strong>
                  <p>{path.ItemsCompleted} completed</p>
                  {path.locked ? (
                    <small>Locked · complete: {path.prerequisites.join(", ")}</small>
                  ) : (
                    <a href={`/learning/${path.Slug}`}>Open path →</a>
                  )}
                </article>
              ))}
            </div>
            {paths.length === 0 && <p>No learning paths are available yet.</p>}
          </section>
          <section>
            <h2>Achievements</h2>
            <div className="metric-grid">
              {achievements.map((a) => (
                <article className="card" key={a.AchievementCode}>
                  <h3>{a.Name}</h3>
                  <p>{a.Description}</p>
                  <small>
                    {a.EarnedAt
                      ? `Earned ${new Date(a.EarnedAt).toLocaleDateString()}`
                      : "Not earned yet"}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
