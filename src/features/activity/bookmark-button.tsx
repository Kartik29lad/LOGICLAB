"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BookmarkButton({
  slug,
  stepNumber,
}: Readonly<{ slug: string; stepNumber?: number }>) {
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
    <Button variant="ghost" size="sm" onClick={save} disabled={busy}>
      {busy ? "Saving…" : "🔖 Bookmark step"}
      {message ? ` · ${message}` : ""}
    </Button>
  );
}
