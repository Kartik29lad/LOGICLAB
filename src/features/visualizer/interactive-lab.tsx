"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Difficulty, SourceContentType } from "@/content/schema/content-types";

import styles from "./interactive-lab.module.css";

export type InteractiveLabItem = {
  slug: string;
  title: string;
  summary: string;
  contentType: Extract<SourceContentType, "ALGORITHM" | "DATA_STRUCTURE">;
  category: string;
  difficulty: Difficulty;
  visualizationType: string;
};

type Scope = "ALL" | "ALGORITHM" | "DATA_STRUCTURE";

const FEATURED_ORDER = [
  "bubble-sort",
  "binary-search",
  "bfs",
  "linked-list",
  "hash-table",
  "stack",
];

const FEATURED_SUMMARIES: Record<string, string> = {
  "bubble-sort": "Sorts elements by repeatedly swapping adjacent elements.",
  "binary-search": "Finds an element in a sorted array by repeatedly dividing the search range.",
  bfs: "Traverses a graph level by level using a queue.",
  "linked-list": "A dynamic linear data structure that stores elements in nodes.",
  "hash-table": "Stores key-value pairs and provides fast lookups using hashing.",
  stack: "A linear data structure that follows the LIFO (Last In, First Out) principle.",
};

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryLabel(item: InteractiveLabItem): string {
  return item.contentType === "ALGORITHM"
    ? toTitleCase(item.category)
    : toTitleCase(item.visualizationType);
}

function difficultyLabel(value: Difficulty): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function cardTone(slug: string): "teal" | "blue" | "violet" {
  if (slug === "binary-search" || slug === "hash-table") return "blue";
  if (slug === "bfs" || slug === "stack") return "violet";
  return "teal";
}

function ScopeIcon({ kind }: { kind: "grid" | "algorithms" | "structures" }) {
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
        <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
        <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
        <rect x="14.5" y="14.5" width="6" height="6" rx="1" />
      </svg>
    );
  }

  if (kind === "algorithms") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="4" r="2.4" />
        <circle cx="5" cy="18" r="2.4" />
        <circle cx="19" cy="18" r="2.4" />
        <path d="M11 6 6 16m7-10 5 10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 9 4.6-9 4.6-9-4.6L12 3Z" />
      <path d="m3 12 9 4.6 9-4.6M3 16.5l9 4.5 9-4.5" />
    </svg>
  );
}

function HomeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7M5.5 9v11h13V9M9.5 20v-6h5v6" />
    </svg>
  );
}

function FlaskMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M18 5h12M21 5v13L10 37a4 4 0 0 0 3.5 6h21a4 4 0 0 0 3.5-6L27 18V5" />
      <path d="M15 33h18M19 28h10M18 37c3-3 5 2 8-1s5 1 8 0" />
    </svg>
  );
}

function LabHeroArtwork() {
  return (
    <Image
      className={styles.heroArtwork}
      src="/images/interactive-lab-hero.png"
      alt="Laptop displaying code, charts and graph visualizations"
      width={415}
      height={188}
      priority
      sizes="(max-width: 760px) 42vw, 415px"
    />
  );
}

function VisualPreview({ item }: { item: InteractiveLabItem }) {
  if (item.slug === "binary-search") {
    return (
      <div className={`${styles.preview} ${styles.previewArray}`} aria-hidden="true">
        {[10, 24, 37, 58, 72].map((value) => (
          <span className={value === 37 ? styles.previewTarget : ""} key={value}>
            {value}
          </span>
        ))}
        <i />
      </div>
    );
  }

  if (item.slug === "bfs") {
    return (
      <svg
        className={`${styles.previewGraphic} ${styles.previewGraph}`}
        viewBox="0 0 150 112"
        aria-hidden="true"
      >
        <path d="M75 24 32 83m43-59 43 59" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="75" cy="24" r="10" />
        <circle cx="32" cy="83" r="10" />
        <circle cx="118" cy="83" r="10" />
      </svg>
    );
  }

  if (item.visualizationType === "array") {
    return (
      <div className={`${styles.preview} ${styles.previewBars}`} aria-hidden="true">
        {[24, 38, 51, 64, 76].map((height, index) => (
          <span key={height} style={{ height: `${height}px` }} data-index={index} />
        ))}
      </div>
    );
  }

  if (item.visualizationType === "graph") {
    return (
      <svg className={styles.previewGraphic} viewBox="0 0 150 112" aria-hidden="true">
        <path
          d="M74 22 30 83m44-61 45 61M30 83h89"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx="74" cy="22" r="10" />
        <circle cx="30" cy="83" r="10" />
        <circle cx="119" cy="83" r="10" />
        <circle cx="74" cy="83" r="8" />
      </svg>
    );
  }

  if (item.visualizationType === "linked-list") {
    return (
      <div className={`${styles.preview} ${styles.previewLinked}`} aria-hidden="true">
        {[10, 20, 30].map((value, index) => (
          <span key={value}>
            {value}
            {index < 2 ? <b>→</b> : null}
          </span>
        ))}
      </div>
    );
  }

  if (item.visualizationType === "hash-table") {
    return (
      <div className={`${styles.preview} ${styles.previewHash}`} aria-hidden="true">
        <span>0</span>
        <b>—</b>
        <span>1</span>
        <b>24</b>
        <span>2</span>
        <b>37</b>
      </div>
    );
  }

  if (item.visualizationType === "stack") {
    return (
      <div className={`${styles.preview} ${styles.previewStack}`} aria-hidden="true">
        <span>30</span>
        <span>20</span>
        <span>10</span>
      </div>
    );
  }

  if (item.visualizationType === "queue") {
    return (
      <div className={`${styles.preview} ${styles.previewLinked}`} aria-hidden="true">
        {[10, 20, 30].map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
    );
  }

  if (item.visualizationType === "heap" || item.visualizationType === "tree") {
    return (
      <svg className={styles.previewGraphic} viewBox="0 0 150 112" aria-hidden="true">
        <path
          d="M75 22 38 72m37-50 37 50M38 72l-18 25m18-25 19 25m56-25-19 25m19-25 18 25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx="75" cy="22" r="10" />
        <circle cx="38" cy="72" r="9" />
        <circle cx="112" cy="72" r="9" />
      </svg>
    );
  }

  return (
    <div className={`${styles.preview} ${styles.previewStack}`} aria-hidden="true">
      <span>01</span>
      <span>02</span>
      <span>03</span>
    </div>
  );
}

function VisualizerCard({ item }: { item: InteractiveLabItem }) {
  const category = categoryLabel(item);
  const difficulty = difficultyLabel(item.difficulty);
  const typeLabel = item.contentType === "ALGORITHM" ? "Algorithm" : "Data Structure";
  const summary = FEATURED_SUMMARIES[item.slug] ?? item.summary;

  return (
    <article className={styles.card} data-tone={cardTone(item.slug)}>
      <div className={styles.cardBody}>
        <div className={styles.cardVisual}>
          <VisualPreview item={item} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardTags}>
            <span className={styles.kindTag} data-kind={item.contentType}>
              {typeLabel}
            </span>
            <span className={styles.categoryTag}>{category}</span>
          </div>
          <h2>{item.title}</h2>
          <p>{summary}</p>
          <span className={styles.difficulty} data-difficulty={item.difficulty}>
            <i aria-hidden="true" />
            {difficulty}
          </span>
        </div>
      </div>
      <Link className={styles.launchButton} href={`/visualizer/${item.slug}`}>
        <span aria-hidden="true">▶</span> Launch Visualizer <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export function InteractiveLab({ items }: Readonly<{ items: InteractiveLabItem[] }>) {
  const [scope, setScope] = useState<Scope>("ALL");
  const [showAll, setShowAll] = useState(false);

  const algorithms = useMemo(
    () => items.filter((item) => item.contentType === "ALGORITHM"),
    [items]
  );
  const structures = useMemo(
    () => items.filter((item) => item.contentType === "DATA_STRUCTURE"),
    [items]
  );

  const visibleItems = useMemo(() => {
    const inScope = items.filter((item) => scope === "ALL" || item.contentType === scope);
    return [...inScope].sort((left, right) => {
      const leftIndex = FEATURED_ORDER.indexOf(left.slug);
      const rightIndex = FEATURED_ORDER.indexOf(right.slug);
      if (leftIndex !== -1 || rightIndex !== -1) {
        if (leftIndex === -1) return 1;
        if (rightIndex === -1) return -1;
        return leftIndex - rightIndex;
      }
      return left.title.localeCompare(right.title);
    });
  }, [items, scope]);

  const totalCount = items.length;
  const featuredItems = scope === "ALL" && !showAll ? visibleItems.slice(0, 6) : visibleItems;
  const canExpand = scope === "ALL" && !showAll && totalCount > 6;

  function selectScope(nextScope: Scope) {
    setScope(nextScope);
    setShowAll(nextScope !== "ALL");
  }

  return (
    <div className={`${styles.page} interactive-lab-page`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" aria-label="Home">
          <HomeMark />
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Interactive Lab</span>
      </nav>

      <section className={styles.hero} aria-labelledby="interactive-lab-title">
        <div className={styles.heroCopy}>
          <div className={styles.heroIcon}>
            <FlaskMark />
          </div>
          <div className={styles.heroText}>
            <h1 id="interactive-lab-title">
              Interactive <span>Lab</span>
            </h1>
            <p>
              Explore step-by-step visualizers for algorithms and data structures. Run examples,
              inspect operations, and understand how each structure changes.
            </p>
          </div>
        </div>
        <LabHeroArtwork />
      </section>

      <section className={styles.catalog} aria-label="Visualizer catalog">
        <div className={styles.scopeTabs} role="group" aria-label="Filter visualizers by category">
          <button
            type="button"
            aria-pressed={scope === "ALL"}
            className={scope === "ALL" ? styles.scopeActive : ""}
            onClick={() => selectScope("ALL")}
          >
            <ScopeIcon kind="grid" /> All Visualizers ({totalCount})
          </button>
          <button
            type="button"
            aria-pressed={scope === "ALGORITHM"}
            className={scope === "ALGORITHM" ? styles.scopeActive : ""}
            onClick={() => selectScope("ALGORITHM")}
          >
            <ScopeIcon kind="algorithms" /> Algorithms ({algorithms.length})
          </button>
          <button
            type="button"
            aria-pressed={scope === "DATA_STRUCTURE"}
            className={scope === "DATA_STRUCTURE" ? styles.scopeActive : ""}
            onClick={() => selectScope("DATA_STRUCTURE")}
          >
            <ScopeIcon kind="structures" /> Data Structures ({structures.length})
          </button>
        </div>

        <div className={styles.cardsGrid} aria-live="polite">
          {featuredItems.map((item) => (
            <VisualizerCard key={item.slug} item={item} />
          ))}
        </div>

        {featuredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No visualizers are available in this section yet.</strong>
            <span>Choose another category to explore the available visualizers.</span>
            <button type="button" onClick={() => selectScope("ALL")}>
              View all visualizers
            </button>
          </div>
        ) : null}

        {canExpand ? (
          <button type="button" className={styles.viewAllButton} onClick={() => setShowAll(true)}>
            View all {totalCount} visualizers <span aria-hidden="true">→</span>
          </button>
        ) : null}
        {scope === "ALL" && showAll && totalCount > 6 ? (
          <button type="button" className={styles.viewAllButton} onClick={() => setShowAll(false)}>
            Show featured visualizers <span aria-hidden="true">↑</span>
          </button>
        ) : null}
      </section>
    </div>
  );
}
