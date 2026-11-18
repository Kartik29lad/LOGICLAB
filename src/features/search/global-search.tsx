"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import styles from "./global-search.module.css";

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type SearchKind = "TOPIC" | "LEARNING_PATH" | "VISUALIZER" | "PRACTICE" | "NOTE";
type ResultTab = "ALL" | "TOPICS" | "VISUALIZERS" | "PRACTICE" | "NOTES";
type SearchCategory =
  "Algorithms" | "Data Structures" | "Programming" | "Cybersecurity" | "Networking";
type SearchGroup = SearchCategory | "Learning Paths" | "Practice" | "Notes";

export interface GlobalSearchRecord {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  group: SearchGroup;
  /** Category filter bucket. Some library items (for example learning paths) do not belong to one. */
  categoryFilter?: SearchCategory;
  category: string;
  difficulty?: Difficulty;
  tags: string[];
  searchableText: string;
}

interface BookmarkApiItem {
  BookmarkId?: string;
  Slug?: string;
  ContentType?: string;
  DisplayName?: string;
  ExperimentId?: string;
  StepNumber?: number | null;
  Note?: string | null;
  CreatedAt?: string;
}

const TABS: Array<{ id: ResultTab; label: string }> = [
  { id: "ALL", label: "All Results" },
  { id: "TOPICS", label: "Topics" },
  { id: "VISUALIZERS", label: "Visualizers" },
  { id: "PRACTICE", label: "Practice" },
  { id: "NOTES", label: "Notes" },
];

const CATEGORY_FILTERS: SearchCategory[] = [
  "Algorithms",
  "Data Structures",
  "Programming",
  "Cybersecurity",
  "Networking",
];
const DIFFICULTY_FILTERS: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 5h16M7 12h10m-7 7h4" />
          <path d="M6 3v4m12-4v4M9 10v4m6-4v4" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" />
          <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M9 7h7m-7 4h7" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 8 6 4-6 4z" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v6h5M9 14h6m-6 4h6" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M4 12h15m-6-6 6 6-6 6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
        </svg>
      );
    case "algorithm":
      return (
        <svg {...common}>
          <path d="M4 19V12m5 7V7m5 12V4m5 15v-9" />
          <path d="M2.5 19.5h19" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8m-4-4h8" />
        </svg>
      );
  }
}

function kindLabel(record: GlobalSearchRecord): string {
  if (record.kind === "VISUALIZER") return "Visualizer";
  if (record.kind === "PRACTICE") return "Practice";
  if (record.kind === "LEARNING_PATH") return "Learning Path";
  if (record.kind === "NOTE") return "Note";
  return record.group === "Data Structures" ? "Data Structure" : "Algorithm";
}

// Keep equally relevant results in a predictable learning-first order.
// This mirrors the approved reference: topic, visualizer, then practice.
const RESULT_KIND_PRIORITY: Record<SearchKind, number> = {
  TOPIC: 0,
  LEARNING_PATH: 1,
  VISUALIZER: 2,
  PRACTICE: 3,
  NOTE: 4,
};

function compareByRelevance(a: GlobalSearchRecord, b: GlobalSearchRecord, query: string): number {
  return (
    scoreRecord(b, query) - scoreRecord(a, query) ||
    RESULT_KIND_PRIORITY[a.kind] - RESULT_KIND_PRIORITY[b.kind] ||
    a.title.localeCompare(b.title) ||
    a.id.localeCompare(b.id)
  );
}

function difficultyLabel(value?: Difficulty): string {
  if (!value) return "";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function scoreRecord(record: GlobalSearchRecord, query: string): number {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;
  if (record.title.toLowerCase() === normalized) return 100;
  if (record.title.toLowerCase().startsWith(normalized)) return 80;
  if (record.title.toLowerCase().includes(normalized)) return 60;
  if (record.searchableText.includes(normalized)) return 35;
  return normalized
    .split(/\s+/)
    .reduce((score, token) => score + (record.searchableText.includes(token) ? 5 : 0), 0);
}

function matchesQuery(record: GlobalSearchRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    record.searchableText.includes(normalized) ||
    normalized.split(/\s+/).every((token) => record.searchableText.includes(token))
  );
}

function bookmarkToRecord(item: BookmarkApiItem): GlobalSearchRecord | null {
  const note = item.Note?.trim();
  if (!note) return null;

  const contentType = item.ContentType?.toUpperCase();
  const categoryFilter: SearchCategory | undefined =
    contentType === "ALGORITHM"
      ? "Algorithms"
      : contentType === "DATA_STRUCTURE"
        ? "Data Structures"
        : undefined;
  const href =
    item.Slug && contentType
      ? `/${contentType === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.Slug}`
      : "/bookmarks";
  const title =
    item.DisplayName?.trim() ||
    (item.StepNumber == null
      ? "Saved topic note"
      : `Saved execution note · Step ${item.StepNumber + 1}`);
  const context = [title, note, item.Slug ?? "", item.ContentType ?? "", item.ExperimentId ?? ""]
    .join(" ")
    .toLowerCase();

  return {
    id: `note-${item.BookmarkId ?? `${item.Slug ?? "saved"}-${item.CreatedAt ?? note.slice(0, 16)}`}`,
    kind: "NOTE",
    title,
    description: note,
    href,
    group: "Notes",
    categoryFilter,
    category:
      categoryFilter === "Algorithms"
        ? "Algorithm note"
        : categoryFilter === "Data Structures"
          ? "Data structure note"
          : "Saved note",
    tags: ["Note", item.StepNumber == null ? "Saved topic" : `Step ${item.StepNumber + 1}`],
    searchableText: context,
  };
}

export function GlobalSearch({
  records,
  initialQuery,
}: Readonly<{ records: GlobalSearchRecord[]; initialQuery: string }>) {
  const [query, setQuery] = useState(initialQuery);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("ALL");
  const [selectedCategories, setSelectedCategories] = useState<SearchCategory[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [noteRecords, setNoteRecords] = useState<GlobalSearchRecord[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bookmarks", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return [] as BookmarkApiItem[];
        const payload = (await response.json()) as { items?: BookmarkApiItem[] };
        return Array.isArray(payload.items) ? payload.items : [];
      })
      .then((items) => {
        if (cancelled) return;
        setNoteRecords(
          items
            .map(bookmarkToRecord)
            .filter((record): record is GlobalSearchRecord => record !== null)
        );
        setNotesLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setNoteRecords([]);
          setNotesLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.tagName === "TEXTAREA" || target.tagName === "SELECT")
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      searchInputRef.current?.focus({ preventScroll: true });
      searchInputRef.current?.select();
    };
    window.addEventListener("keydown", handleShortcut, true);
    return () => window.removeEventListener("keydown", handleShortcut, true);
  }, []);

  const allRecords = useMemo(() => [...records, ...noteRecords], [records, noteRecords]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = allRecords.filter((record) => {
      const queryMatches = matchesQuery(record, normalized);
      const matchesTab =
        activeTab === "ALL" ||
        (activeTab === "TOPICS" && (record.kind === "TOPIC" || record.kind === "LEARNING_PATH")) ||
        (activeTab === "VISUALIZERS" && record.kind === "VISUALIZER") ||
        (activeTab === "PRACTICE" && record.kind === "PRACTICE") ||
        (activeTab === "NOTES" && record.kind === "NOTE");
      const matchesCategory =
        selectedCategories.length === 0 ||
        (record.categoryFilter !== undefined && selectedCategories.includes(record.categoryFilter));
      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        (record.difficulty !== undefined && selectedDifficulties.includes(record.difficulty));
      return queryMatches && matchesTab && matchesCategory && matchesDifficulty;
    });

    if (sortBy === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "difficulty") {
      const order: Record<Difficulty, number> = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };
      list = [...list].sort(
        (a, b) =>
          (a.difficulty ? order[a.difficulty] : 3) - (b.difficulty ? order[b.difficulty] : 3) ||
          a.title.localeCompare(b.title)
      );
    } else list = [...list].sort((a, b) => compareByRelevance(a, b, normalized));
    return list;
  }, [allRecords, query, activeTab, selectedCategories, selectedDifficulties, sortBy]);

  const matchingRecords = useMemo(
    () => allRecords.filter((record) => matchesQuery(record, query)),
    [allRecords, query]
  );
  const tabCounts: Record<ResultTab, number> = {
    ALL: matchingRecords.length,
    TOPICS: matchingRecords.filter(
      (record) => record.kind === "TOPIC" || record.kind === "LEARNING_PATH"
    ).length,
    VISUALIZERS: matchingRecords.filter((record) => record.kind === "VISUALIZER").length,
    PRACTICE: matchingRecords.filter((record) => record.kind === "PRACTICE").length,
    NOTES: matchingRecords.filter((record) => record.kind === "NOTE").length,
  };

  const categoryCounts = CATEGORY_FILTERS.map((category) => ({
    label: category,
    count: matchingRecords.filter((record) => record.categoryFilter === category).length,
  }));
  const difficultyCounts = DIFFICULTY_FILTERS.map((difficulty) => ({
    difficulty,
    count: matchingRecords.filter((record) => record.difficulty === difficulty).length,
  }));

  function toggleCategory(category: SearchCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }
  function toggleDifficulty(difficulty: Difficulty) {
    setSelectedDifficulties((current) =>
      current.includes(difficulty)
        ? current.filter((item) => item !== difficulty)
        : [...current, difficulty]
    );
  }
  function clearFilters() {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedDifficulties.length > 0;
  const queryLabel = query.trim() ? `results for “${query.trim()}”` : "searchable resources";

  return (
    <div className={styles.page} data-page="global-search">
      <div className={styles.breadcrumb}>
        <Link href="/" aria-label="Home">
          Home
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Global Search</span>
      </div>

      <section className={styles.hero} aria-labelledby="global-search-heading">
        <div className={styles.heroCopy}>
          <h1 id="global-search-heading">
            Global <span>Search</span>
          </h1>
          <p className={styles.subtitle}>
            Search across all topics, visualizers, and learning resources in LogicLab.
          </p>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <svg viewBox="0 0 440 210" role="img">
            <defs>
              <linearGradient id="searchCard" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#164052" />
                <stop offset="1" stopColor="#101d31" />
              </linearGradient>
              <linearGradient id="searchPanel" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#17445a" />
                <stop offset="1" stopColor="#0f2538" />
              </linearGradient>
              <linearGradient id="searchLens" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#62f0d8" />
                <stop offset="1" stopColor="#3189e8" />
              </linearGradient>
              <filter id="searchGlow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M30 177 91 47l290 18 36 105-105 24z" fill="#062c36" opacity=".48" />
            <g transform="translate(48 51) skewY(-10)" opacity=".9">
              <rect
                x="0"
                y="22"
                width="116"
                height="91"
                rx="12"
                fill="#0e4150"
                stroke="#087c86"
                strokeWidth="2"
              />
              <path
                d="M17 44h77M17 63h61M17 82h73"
                stroke="#1cc4ac"
                strokeWidth="7"
                strokeLinecap="round"
                opacity=".7"
              />
            </g>
            <g transform="translate(266 40) skewY(9)" opacity=".9">
              <rect
                x="0"
                y="18"
                width="128"
                height="104"
                rx="13"
                fill="#0e4550"
                stroke="#159d88"
                strokeWidth="2"
              />
              <path
                d="M18 43h91M18 64h71M18 85h82"
                stroke="#20c69f"
                strokeWidth="7"
                strokeLinecap="round"
                opacity=".66"
              />
            </g>
            <g transform="translate(105 18) skewY(-7)">
              <rect
                x="0"
                y="22"
                width="226"
                height="145"
                rx="19"
                fill="#0b2133"
                stroke="#17647e"
                strokeWidth="2.5"
              />
              <rect x="12" y="34" width="202" height="121" rx="12" fill="url(#searchCard)" />
              <circle cx="27" cy="22" r="5" fill="#3ce8cd" />
              <circle cx="44" cy="22" r="5" fill="#3ba8ea" />
              <circle cx="61" cy="22" r="5" fill="#54d7b7" />
              <path
                d="M30 65h94M30 88h136M30 111h100"
                stroke="#2d9bb0"
                strokeWidth="8"
                strokeLinecap="round"
                opacity=".7"
              />
              <path
                d="m169 77 13 12-13 12m-18-24-13 12 13 12"
                fill="none"
                stroke="#71e7e0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <g filter="url(#searchGlow)" transform="translate(286 101) rotate(-9)">
              <circle
                cx="0"
                cy="0"
                r="51"
                fill="#0e2d48"
                stroke="url(#searchLens)"
                strokeWidth="10"
              />
              <circle cx="0" cy="0" r="37" fill="#102c42" stroke="#68b8f4" strokeWidth="2" />
              <path
                d="m-17 -9 17-14 17 14m-34 18L0 23 17 9m-34-18v18m34-18v18"
                fill="none"
                stroke="#65e8e2"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m37 37 48 48"
                stroke="url(#searchLens)"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </section>

      <form
        className={styles.searchForm}
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Icon name="search" size={25} />
        <label className={styles.visuallyHidden} htmlFor="global-search-query">
          Search topics, algorithms and learning resources
        </label>
        <input
          ref={searchInputRef}
          id="global-search-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search topics, algorithms, data structures..."
          autoComplete="off"
          aria-keyshortcuts="Control+K Meta+K"
        />
        {query && (
          <button
            type="button"
            className={styles.clearQuery}
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <Icon name="close" size={19} />
          </button>
        )}
      </form>

      <div className={styles.tabsAndSort}>
        <div className={styles.tabs} role="tablist" aria-label="Search result types">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>
                <Icon
                  name={
                    tab.id === "ALL"
                      ? "grid"
                      : tab.id === "TOPICS"
                        ? "book"
                        : tab.id === "VISUALIZERS"
                          ? "play"
                          : tab.id === "PRACTICE"
                            ? "code"
                            : "file"
                  }
                  size={18}
                />
              </span>
              {tab.label} <span className={styles.tabCount}>({tabCounts[tab.id]})</span>
            </button>
          ))}
        </div>
        <label className={styles.sortControl}>
          Sort by:
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort search results"
          >
            <option value="relevance">Relevance</option>
            <option value="title">Title A–Z</option>
            <option value="difficulty">Difficulty</option>
          </select>
          <Icon name="chevron" size={15} />
        </label>
      </div>

      <div className={styles.resultsLayout}>
        <aside
          className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : styles.filtersClosed}`}
          aria-label="Filter search results"
        >
          <div className={styles.filterHeading}>
            <span>
              <Icon name="filter" size={19} /> Filter Results
            </span>
            <button
              type="button"
              className={styles.clearFilters}
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All
            </button>
            <button
              type="button"
              className={styles.mobileFilterToggle}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <Icon name="chevron" size={16} />
            </button>
          </div>
          {filtersOpen && (
            <div className={styles.filterBody}>
              <section className={styles.filterGroup}>
                <h2>Category</h2>
                {categoryCounts.map((item) => (
                  <label
                    className={`${styles.checkRow} ${item.count === 0 ? styles.checkRowEmpty : ""}`}
                    key={item.label}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(item.label)}
                      disabled={item.count === 0}
                      onChange={() => toggleCategory(item.label)}
                    />
                    <span className={styles.customCheck} aria-hidden="true" />
                    <span>{item.label}</span>
                    <span className={styles.filterCount}>({item.count})</span>
                  </label>
                ))}
              </section>
              <section className={styles.filterGroup}>
                <h2>Difficulty</h2>
                {difficultyCounts.map((item) => (
                  <label
                    className={`${styles.checkRow} ${item.count === 0 ? styles.checkRowEmpty : ""}`}
                    key={item.difficulty}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.includes(item.difficulty)}
                      disabled={item.count === 0}
                      onChange={() => toggleDifficulty(item.difficulty)}
                    />
                    <span className={styles.customCheck} aria-hidden="true" />
                    <span>{difficultyLabel(item.difficulty)}</span>
                    <span className={styles.filterCount}>({item.count})</span>
                  </label>
                ))}
              </section>
            </div>
          )}
        </aside>

        <section className={styles.results} aria-live="polite">
          <div className={styles.resultsHeader}>
            <h2>
              <strong>{filtered.length}</strong> {queryLabel}
            </h2>
            {activeTab === "NOTES" && !notesLoaded ? (
              <span className={styles.loadingNotes}>Loading saved notes…</span>
            ) : null}
            {hasActiveFilters && (
              <button type="button" className={styles.clearInline} onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
          {filtered.length > 0 ? (
            <div className={styles.resultList}>
              {filtered.map((record) => {
                const categoryTag = record.category
                  .split(/[\s_-]+/)
                  .filter(Boolean)
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                  .join(" ");
                const preferredTags =
                  record.kind === "VISUALIZER"
                    ? [
                        "Visualizer",
                        record.group === "Data Structures" ? "Data Structure" : "Algorithm",
                      ]
                    : record.kind === "PRACTICE"
                      ? ["Practice", categoryTag]
                      : record.kind === "NOTE"
                        ? ["Note", categoryTag]
                        : [kindLabel(record), categoryTag, ...record.tags];
                const seenTags = new Set<string>();
                const tags = preferredTags
                  .filter((tag) => {
                    const normalized = tag.trim().toLowerCase();
                    if (
                      !normalized ||
                      seenTags.has(normalized) ||
                      [
                        "intermediate",
                        "beginner",
                        "advanced",
                        "algorithms",
                        "data structures",
                      ].includes(normalized)
                    )
                      return false;
                    seenTags.add(normalized);
                    return true;
                  })
                  .slice(0, 3);
                return (
                  <article className={styles.resultCard} key={record.id}>
                    <div
                      className={`${styles.resultIcon} ${record.kind === "VISUALIZER" ? styles.resultIconBlue : record.kind === "PRACTICE" ? styles.resultIconViolet : record.kind === "NOTE" ? styles.resultIconNote : ""}`}
                    >
                      <Icon
                        name={
                          record.kind === "VISUALIZER"
                            ? "play"
                            : record.kind === "PRACTICE"
                              ? "code"
                              : record.kind === "NOTE"
                                ? "file"
                                : record.kind === "LEARNING_PATH"
                                  ? "book"
                                  : "code"
                        }
                        size={29}
                      />
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitleRow}>
                        <h3>{record.title}</h3>
                        {record.difficulty ? (
                          <span
                            className={`${styles.difficulty} ${styles[`difficulty${record.difficulty}`]}`}
                          >
                            <Icon name="algorithm" size={14} />
                            {difficultyLabel(record.difficulty)}
                          </span>
                        ) : null}
                      </div>
                      <p>{record.description}</p>
                      <div className={styles.tags}>
                        {tags.map((tag) => (
                          <span className={styles.tag} key={`${record.id}-${tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={record.href}
                      className={styles.resultAction}
                      aria-label={`Open ${record.title}`}
                    >
                      <Icon name="arrow" size={20} />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>
                <Icon name="search" size={26} />
              </span>
              <h3>
                {activeTab === "NOTES"
                  ? notesLoaded
                    ? "No saved notes found"
                    : "Loading saved notes"
                  : query.trim()
                    ? "No matching results"
                    : "Start your search"}
              </h3>
              <p>
                {activeTab === "NOTES"
                  ? "Notes saved with your LogicLab bookmarks appear here when they contain a note."
                  : query.trim()
                    ? `No resources matched “${query.trim()}”. Try a broader search or clear your filters.`
                    : "Search algorithms, data structures, visualizers and practice challenges across LogicLab."}
              </p>
              {(query || hasActiveFilters) && activeTab !== "NOTES" ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    clearFilters();
                    setActiveTab("ALL");
                  }}
                >
                  Reset search
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
