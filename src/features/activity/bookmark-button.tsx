"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BookmarkButton({
  slug,
  stepNumber,
  compact = false,
}: Readonly<{ slug: string; stepNumber?: number; compact?: boolean }>) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, stepNumber }),
    });
    setMessage(response.ok ? "Step bookmarked." : "Sign in to save bookmarks.");
    setBusy(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={compact ? "bookmark-button--compact" : undefined}
      onClick={save}
      disabled={busy}
      aria-label={busy ? "Saving bookmark" : "Bookmark current step"}
      title={message || "Bookmark current step"}
    >
      {compact ? (
        <>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z" />
          </svg>
          <span className="sr-only">{busy ? "Saving…" : message || "Bookmark step"}</span>
        </>
      ) : (
        <>
          {busy ? "Saving…" : "🔖 Bookmark step"}
          {message ? ` · ${message}` : ""}
        </>
      )}
    </Button>
  );
}
