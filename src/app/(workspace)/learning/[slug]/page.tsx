"use client";

import { use, useEffect, useState } from "react";

type Item = {
  ItemSlug: string;
  ItemContentType: string;
  Status: string;
  CompletionPercent: number;
  CompletedAt: string | null;
};
type Path = {
  DisplayName: string;
  Status: string;
  CompletionPercent: number;
  ItemsCompleted: number;
};
export default function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<{ path: Path; items: Item[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/learning-paths?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((body) => (body.error ? setError(body.error.message) : setData(body)))
      .catch(() => setError("Unable to load this learning path."));
  }, [slug]);
  if (error)
    return (
      <main className="page-content">
        <h1>Learning Path</h1>
        <p>{error}</p>
      </main>
    );
  if (!data)
    return (
      <main className="page-content">
        <h1>Learning Path</h1>
        <p>Loading…</p>
      </main>
    );
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Learning Path</span>
          <h1>{data.path.DisplayName}</h1>
          <p>
            {data.path.CompletionPercent}% complete · {data.path.ItemsCompleted} items complete
          </p>
        </div>
      </header>
      <section className="card">
        <ol>
          {data.items.map((item) => (
            <li key={item.ItemSlug}>
              <strong>{item.ItemSlug}</strong> — {item.Status.replace("_", " ")} (
              {item.CompletionPercent}%)
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
