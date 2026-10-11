"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Bookmark {
  BookmarkId: string;
  Slug?: string;
  ContentType?: string;
  DisplayName?: string;
  ExperimentId?: string;
  StepNumber?: number;
  Note?: string;
  CreatedAt: string;
}

export default function BookmarksPage() {
  const [items, setItems] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState("");
  const load = () =>
    fetch("/api/bookmarks")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error?.message ?? "Unable to load bookmarks.");
        setItems(data.items ?? []);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, []);
  async function remove(id: string) {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    await load();
  }
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Saved moments</span>
          <h1>Bookmarks</h1>
          <p>Save important steps and return to them later.</p>
        </div>
      </header>
      {error ? (
        <p>
          {error} <Link href="/login">Sign in</Link>
        </p>
      ) : items === null ? (
        <p>Loading bookmarks…</p>
      ) : items.length === 0 ? (
        <section className="card">
          <h2>No bookmarks yet</h2>
          <p>Use “Bookmark step” inside a visualizer to save an important moment.</p>
        </section>
      ) : (
        <section className="activity-list">
          {items.map((item) => (
            <article className="card activity-item" key={item.BookmarkId}>
              <div>
                <strong>{item.DisplayName ?? `Experiment ${item.ExperimentId}`}</strong>
                <span>
                  {item.StepNumber === undefined || item.StepNumber === null
                    ? "Concept bookmark"
                    : `Step ${item.StepNumber + 1}`}
                  {item.Note ? ` · ${item.Note}` : ""}
                </span>
              </div>
              {item.Slug && item.ContentType ? (
                <Link
                  href={`/${item.ContentType === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.Slug}`}
                >
                  Open
                </Link>
              ) : null}
              <button
                className="button button--ghost button--sm"
                type="button"
                onClick={() => remove(item.BookmarkId)}
              >
                Remove
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
