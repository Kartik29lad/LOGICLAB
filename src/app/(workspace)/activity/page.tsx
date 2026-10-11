"use client";

import { useEffect, useState } from "react";

interface ActivityDay {
  ActivityDate: string;
  ActivityCount: number;
  LearningMinutes: number;
  AlgorithmsCompleted: number;
  ChallengesCompleted: number;
  DataStructuresCompleted: number;
}

interface ActivityResponse {
  days?: ActivityDay[];
  error?: { message: string };
}

export default function ActivityPage() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  useEffect(() => {
    fetch("/api/activity?days=30")
      .then((r) => r.json())
      .then((res: ActivityResponse) => setData(res));
  }, []);
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Consistency</span>
          <h1>Activity</h1>
          <p>A daily summary of your learning activity.</p>
        </div>
      </header>
      {!data ? (
        <p>Loading activity…</p>
      ) : data.error ? (
        <p>{data.error.message}</p>
      ) : (
        <section className="activity-list">
          {data.days?.map((day) => (
            <article className="card activity-item" key={day.ActivityDate}>
              <strong>{day.ActivityDate}</strong>
              <span>
                {day.ActivityCount} activities · {day.LearningMinutes} learning min
              </span>
              <span>
                {day.AlgorithmsCompleted} algorithms · {day.ChallengesCompleted} challenges ·{" "}
                {day.DataStructuresCompleted} data structures
              </span>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
