"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ContentActions({ slug }: Readonly<{ slug: string }>) {
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/favorites")
      .then((response) => response.json())
      .then((data) =>
        setFavorite(
          Array.isArray(data.items) &&
            data.items.some((item: { Slug?: string }) => item.Slug === slug)
        )
      )
      .catch(() => undefined)
      .finally(() => setBusy(false));
    const historyKey = `logiclab-history-view:${slug}`;
    if (!sessionStorage.getItem(historyKey)) {
      void fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "VIEW", contentSlug: slug }),
      });
      void fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: "CONTENT_VIEW", contentSlug: slug }),
      });
      sessionStorage.setItem(historyKey, "1");
    }
  }, [slug]);

  async function toggleFavorite() {
    setBusy(true);
    const next = !favorite;
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, favorite: next }),
    });
    if (response.ok) {
      setFavorite(next);
      setMessage(next ? "Added to favorites." : "Removed from favorites.");
    } else setMessage("Sign in to manage favorites.");
    setBusy(false);
  }

  return (
    <div className="content-actions">
      <Button variant="secondary" size="sm" onClick={toggleFavorite} disabled={busy}>
        {favorite ? "★ Favorited" : "☆ Add to favorites"}
      </Button>
      {message ? <span aria-live="polite">{message}</span> : null}
    </div>
  );
}
