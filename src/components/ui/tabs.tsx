"use client";

import { useId, useRef, useState } from "react";

export type Tab = { id: string; label: string; content: React.ReactNode };
export function Tabs({ tabs, defaultTab }: Readonly<{ tabs: Tab[]; defaultTab?: string }>) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = tabs.find((tab) => tab.id === active) ?? tabs[0];
  const selectByIndex = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    if (!next) return;
    setActive(next.id);
    requestAnimationFrame(() => refs.current[(index + tabs.length) % tabs.length]?.focus());
  };

  return (
    <div className="tabs">
      <div
        className="tabs__list"
        role="tablist"
        aria-label="Content sections"
        onKeyDown={(event) => {
          const index = tabs.findIndex((tab) => tab.id === active);
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectByIndex(index + 1);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectByIndex(index - 1);
          }
          if (event.key === "Home") {
            event.preventDefault();
            selectByIndex(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            selectByIndex(tabs.length - 1);
          }
        }}
      >
        {tabs.map((tab, index) => {
          const selectedTab = tab.id === selected?.id;
          return (
            <button
              ref={(node) => {
                refs.current[index] = node;
              }}
              id={`${baseId}-${tab.id}-tab`}
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedTab}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={selectedTab ? 0 : -1}
              className={`tab ${selectedTab ? "tab--active" : ""}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={selected ? `${baseId}-${selected.id}-panel` : undefined}
        className="tabs__panel"
        role="tabpanel"
        aria-labelledby={selected ? `${baseId}-${selected.id}-tab` : undefined}
        tabIndex={0}
      >
        {selected?.content}
      </div>
    </div>
  );
}
