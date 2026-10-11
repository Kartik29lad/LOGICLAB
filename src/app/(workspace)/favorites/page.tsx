"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Favorite {
  FavoriteId: string;
  Slug: string;
  ContentType: string;
  DisplayName: string;
  CreatedAt: string;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<Favorite[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/favorites")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error?.message ?? "Unable to load favorites.");
        setItems(data.items ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Learning library</span>
          <h1>Favorites</h1>
          <p>Your saved concepts, available on every signed-in device.</p>
        </div>
      </header>
      {error ? (
        <p>
          {error} <Link href="/login">Sign in</Link>
        </p>
      ) : items === null ? (
        <p>Loading favorites…</p>
      ) : items.length === 0 ? (
        <section className="card">
          <h2>No favorites yet</h2>
          <p>Add algorithms or data structures to keep them close at hand.</p>
        </section>
      ) : (
        <section className="activity-list">
          {items.map((item) => (
            <Link
              className="card activity-item"
              key={item.FavoriteId}
              href={`/${item.ContentType === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.Slug}`}
            >
              <strong>{item.DisplayName}</strong>
              <span>{item.ContentType.replace("_", " ")}</span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
