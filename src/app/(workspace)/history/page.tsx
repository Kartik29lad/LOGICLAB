"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryItem {
  HistoryId: string;
  ActionType: string;
  CreatedAt: string;
  Slug?: string;
  ContentType?: string;
  DisplayName?: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/history?limit=50")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error?.message ?? "Unable to load history.");
        setItems(data.items ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Learning trail</span>
          <h1>History</h1>
          <p>Return to recent learning activity without losing your place.</p>
        </div>
      </header>
      {error ? (
        <p>
          {error} <Link href="/login">Sign in</Link>
        </p>
      ) : items === null ? (
        <p>Loading history…</p>
      ) : items.length === 0 ? (
        <section className="card">
          <h2>No history yet</h2>
          <p>Open an algorithm or data structure to start building your learning trail.</p>
        </section>
      ) : (
        <section className="activity-list">
          {items.map((item) => (
            <article className="card activity-item" key={item.HistoryId}>
              <div>
                <strong>{item.DisplayName ?? item.ActionType}</strong>
                <span>{item.ActionType}</span>
              </div>
              {item.Slug && item.ContentType ? (
                <Link
                  href={`/${item.ContentType === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.Slug}`}
                >
                  Open
                </Link>
              ) : null}
              <time dateTime={item.CreatedAt}>{new Date(item.CreatedAt).toLocaleString()}</time>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
