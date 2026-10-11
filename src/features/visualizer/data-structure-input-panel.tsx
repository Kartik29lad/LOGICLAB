"use client";

import { useEffect, useState } from "react";

export function DataStructureInputPanel({
  slug,
  disabled,
  onApply,
}: {
  slug: "stack" | "queue" | "linked-list" | "hash-table" | "heap";
  disabled: boolean;
  onApply: (values: number[]) => void;
}): React.JSX.Element {
  const [value, setValue] = useState("10, 20, 30, 40");
  useEffect(() => setValue("10, 20, 30, 40"), [slug]);
  const apply = (): void => {
    const values = value
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (!values.length || values.length > 20 || values.some((item) => !Number.isFinite(item)))
      return;
    onApply(values);
  };
  const label =
    slug === "stack"
      ? "Stack values"
      : slug === "queue"
        ? "Queue values"
        : slug === "linked-list"
          ? "Linked-list values"
          : slug === "hash-table"
            ? "Hash keys"
            : "Heap values";
  return (
    <section className="linear-input-panel" aria-label={`${label} controls`}>
      <div>
        <strong>{label}</strong>
        <span>Change the structure, then replay the real operations.</span>
      </div>
      <label>
        Values
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          placeholder="10, 20, 30, 40"
        />
      </label>
      <button type="button" disabled={disabled} onClick={apply}>
        Run structure
      </button>
    </section>
  );
}
