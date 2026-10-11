"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProgressActivityItem {
  itemSlug: string;
  itemType: string;
}

interface ProgressResponse {
  algorithmsCompleted?: number;
  challengesCompleted?: number;
  totalTimeSpentSeconds?: number;
  recentActivity?: ProgressActivityItem[];
  error?: { message: string; code?: string };
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((res: ProgressResponse) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setData({ error: { message: "Unable to load progress data." } });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page-content">
        <header className="page-header">
          <div>
            <span className="page-header__eyebrow">Workspace</span>
            <h1>Your Progress</h1>
            <p>Loading your learning statistics…</p>
          </div>
        </header>
        <div className="card">
          <p className="text-muted">Retrieving session records from LogicLab…</p>
        </div>
      </main>
    );
  }

  if (data?.error) {
    return (
      <main className="page-content">
        <header className="page-header">
          <div>
            <span className="page-header__eyebrow">Workspace</span>
            <h1>Your Progress</h1>
            <p>Personalized learning statistics and activity tracking.</p>
          </div>
        </header>
        <div className="card progress-auth-prompt">
          <div className="card__header">
            <span className="eyebrow">Authentication Required</span>
            <h2>Sign in to track your learning journey</h2>
            <p className="text-muted">
              Connect to your LogicLab account to record completed algorithm visualizers, practice
              challenge scores, and track your milestone progress across all learning paths.
            </p>
          </div>
          <div className="progress-auth-prompt__actions">
            <Link href="/login" className="button button--primary">
              Sign In
            </Link>
            <Link href="/register" className="button button--secondary">
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const algorithmsCount = data?.algorithmsCompleted ?? 0;
  const challengesCount = data?.challengesCompleted ?? 0;
  const timeSpentSec = data?.totalTimeSpentSeconds ?? 0;
  const formattedTime =
    timeSpentSec >= 60
      ? `${Math.floor(timeSpentSec / 60)}m ${timeSpentSec % 60}s`
      : `${timeSpentSec}s`;

  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Learning Analytics</span>
          <h1>Your Progress</h1>
          <p>Review completed algorithms, practice challenge scores, and active study sessions.</p>
        </div>
      </header>

      <div className="metric-grid">
        <article className="card">
          <span className="text-caption text-muted">Algorithms Completed</span>
          <strong>{algorithmsCount}</strong>
          <span className="text-caption text-muted">Concepts mastered</span>
        </article>
        <article className="card">
          <span className="text-caption text-muted">Challenges Solved</span>
          <strong>{challengesCount}</strong>
          <span className="text-caption text-muted">Predictions verified</span>
        </article>
        <article className="card">
          <span className="text-caption text-muted">Challenge Practice Time</span>
          <strong>{formattedTime}</strong>
          <span className="text-caption text-muted">Active reasoning</span>
        </article>
      </div>

      <section className="card progress-recent-section">
        <div className="card__header">
          <h2>Recent Activity</h2>
          <span className="text-caption text-muted">Your latest completed milestones</span>
        </div>
        {!data?.recentActivity || data.recentActivity.length === 0 ? (
          <div className="progress-empty-state">
            <p className="text-muted">
              No completed activities recorded yet. Run a visualizer trace or solve a practice
              challenge to build your progress history.
            </p>
            <div className="progress-empty-state__actions">
              <Link href="/visualizer" className="button button--secondary button--sm">
                Explore Visualizers →
              </Link>
              <Link href="/challenges" className="button button--secondary button--sm">
                Practice Challenges →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="progress-activity-list">
            {data.recentActivity.map((activity, idx) => (
              <li key={`${activity.itemSlug}-${idx}`} className="progress-activity-item">
                <div className="progress-activity-item__info">
                  <span className="progress-activity-item__slug">{activity.itemSlug}</span>
                  <span className="badge badge--subtle">{activity.itemType}</span>
                </div>
                <Link
                  href={
                    activity.itemType === "challenge"
                      ? `/challenges/${activity.itemSlug}`
                      : `/visualizer/${activity.itemSlug}`
                  }
                  className="button button--secondary button--sm"
                >
                  Review ↗
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
