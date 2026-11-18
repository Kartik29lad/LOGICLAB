"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ContentPackage, Difficulty } from "@/content/schema/content-types";

import styles from "./explore-library.module.css";

type ContentKind = "ALGORITHM" | "DATA_STRUCTURE";
type CategoryName = "Sorting" | "Searching" | "Trees" | "Graphs" | "Others";
type CategoryCardName = CategoryName | "All Topics";
type SortMode = "CURATED" | "AZ" | "BEGINNER" | "ADVANCED";

const TYPES: ContentKind[] = ["ALGORITHM", "DATA_STRUCTURE"];
const DIFFICULTIES: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const CATEGORY_ORDER: CategoryName[] = ["Sorting", "Searching", "Trees", "Graphs", "Others"];

function getCategory(item: ContentPackage): CategoryName {
  const category = item.metadata.category.toLowerCase();
  const slug = item.metadata.slug.toLowerCase();
  if (category === "sorting") return "Sorting";
  if (category === "searching") return "Searching";
  if (category === "graphs" || slug === "graph") return "Graphs";
  if (slug.includes("tree")) return "Trees";
  return "Others";
}

function toTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function detailHref(item: ContentPackage) {
  return item.metadata.type === "ALGORITHM"
    ? `/algorithms/${item.metadata.slug}`
    : `/data-structures/${item.metadata.slug}`;
}

function Glyph({
  kind,
}: Readonly<{
  kind: CategoryCardName | "search" | "filter" | "bookmark" | "arrow" | "grid" | "list" | "chevron";
}>) {
  if (kind === "search")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg>
    );
  if (kind === "filter")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16l-6.5 7.5v5L10 19v-6.5z" />
      </svg>
    );
  if (kind === "bookmark")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4z" />
      </svg>
    );
  if (kind === "arrow")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h15m-6-6 6 6-6 6" />
      </svg>
    );
  if (kind === "grid")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  if (kind === "list")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    );
  if (kind === "chevron")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  if (kind === "All Topics")
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="6" y="6" width="14" height="14" rx="2" />
        <rect x="28" y="6" width="14" height="14" rx="2" />
        <rect x="6" y="28" width="14" height="14" rx="2" />
        <rect x="28" y="28" width="14" height="14" rx="2" />
      </svg>
    );
  if (kind === "Sorting")
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 39V27h7v12M21 39V18h7v21M34 39V8h7v31" />
      </svg>
    );
  if (kind === "Searching")
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="21" cy="21" r="12" />
        <path d="m30 30 10 10" />
      </svg>
    );
  if (kind === "Trees")
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="9" r="4" />
        <circle cx="10" cy="37" r="4" />
        <circle cx="38" cy="37" r="4" />
        <path d="M24 13v10M24 23 10 33M24 23l14 10" />
      </svg>
    );
  if (kind === "Graphs")
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="8" r="4" />
        <circle cx="9" cy="35" r="4" />
        <circle cx="39" cy="35" r="4" />
        <circle cx="24" cy="25" r="4" />
        <path d="m22 12-10 19m14-19 10 19M13 35h22M24 12v9" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="m24 6 17 9-17 9-17-9zM7 24l17 9 17-9M7 33l17 9 17-9" />
    </svg>
  );
}

export function ExploreLibrary({
  items,
  initialQuery = "",
  initialCategory = "ALL",
  initialDifficulty = "ALL",
}: Readonly<{
  items: ContentPackage[];
  initialQuery?: string;
  initialCategory?: string;
  initialDifficulty?: Difficulty | "ALL";
}>) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [types, setTypes] = useState<ContentKind[]>(TYPES);
  const [difficulties, setDifficulties] = useState<Difficulty[]>(
    initialDifficulty === "ALL" ? [] : [initialDifficulty]
  );
  const [categories, setCategories] = useState<CategoryName[]>(
    initialCategory === "ALL" ? [] : [initialCategory as CategoryName]
  );
  const [sort, setSort] = useState<SortMode>("CURATED");
  const [listView, setListView] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");
  const categoryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    const globalSearch = document.getElementById("global-search-input");
    if (globalSearch instanceof HTMLInputElement) globalSearch.value = initialQuery;
  }, [initialQuery]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { items?: Array<{ Slug?: string }> };
        if (!cancelled) {
          setFavorites(
            new Set(
              (data.items ?? [])
                .map((item) => item.Slug)
                .filter((slug): slug is string => Boolean(slug))
            )
          );
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map<CategoryName, number>();
    items.forEach((item) => {
      const category = getCategory(item);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    });
    return CATEGORY_ORDER.filter((name) => (counts.get(name) ?? 0) > 0).map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    }));
  }, [items]);

  const categoryCards = useMemo(
    () => [{ name: "All Topics" as const, count: items.length }, ...categoryCounts],
    [categoryCounts, items.length]
  );

  const typeCounts = useMemo(
    () => ({
      ALGORITHM: items.filter((item) => item.metadata.type === "ALGORITHM").length,
      DATA_STRUCTURE: items.filter((item) => item.metadata.type === "DATA_STRUCTURE").length,
    }),
    [items]
  );

  const difficultyCounts = useMemo(
    () =>
      DIFFICULTIES.map((name) => ({
        name,
        count: items.filter((item) => item.metadata.difficulty === name).length,
      })),
    [items]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesType = types.includes(item.metadata.type as ContentKind);
      const matchesDifficulty =
        !difficulties.length || difficulties.includes(item.metadata.difficulty);
      const matchesCategory = !categories.length || categories.includes(getCategory(item));
      const text = [
        item.metadata.title,
        item.metadata.summary,
        item.metadata.description,
        item.metadata.category,
        ...item.metadata.tags,
        ...item.metadata.prerequisites,
        ...item.metadata.learningObjectives,
        ...(item.concepts ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return matchesType && matchesDifficulty && matchesCategory && (!term || text.includes(term));
    });
    if (sort === "AZ")
      return filtered.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
    if (sort === "BEGINNER" || sort === "ADVANCED") {
      const rank: Record<Difficulty, number> =
        sort === "BEGINNER"
          ? { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 }
          : { ADVANCED: 0, INTERMEDIATE: 1, BEGINNER: 2 };
      return filtered.sort(
        (a, b) =>
          rank[a.metadata.difficulty] - rank[b.metadata.difficulty] ||
          a.metadata.title.localeCompare(b.metadata.title)
      );
    }
    return filtered;
  }, [items, query, types, difficulties, categories, sort]);

  const activeTab = types.length === 2 ? "ALL" : (types[0] ?? "ALL");
  const hasFilters =
    Boolean(query.trim()) || types.length !== 2 || difficulties.length > 0 || categories.length > 0;

  function resetFilters() {
    setQuery("");
    setTypes(TYPES);
    setDifficulties([]);
    setCategories([]);
    setSort("CURATED");
    const globalSearch = document.getElementById("global-search-input");
    if (globalSearch instanceof HTMLInputElement) globalSearch.value = "";
    router.replace("/algorithms", { scroll: false });
  }

  function toggleValue<T extends string>(
    setter: (next: T[] | ((current: T[]) => T[])) => void,
    value: T
  ) {
    setter((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
    );
  }

  async function toggleFavorite(slug: string) {
    if (busy.has(slug)) return;
    const next = !favorites.has(slug);
    setBusy((current) => new Set(current).add(slug));
    setFeedback("");
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, favorite: next }),
      });
      if (!response.ok) {
        setFeedback(
          response.status === 401
            ? "Sign in to save topics."
            : "Unable to update Favorites. Please try again."
        );
        return;
      }
      setFavorites((current) => {
        const updated = new Set(current);
        if (next) updated.add(slug);
        else updated.delete(slug);
        return updated;
      });
      setFeedback(next ? "Topic added to Favorites." : "Topic removed from Favorites.");
    } catch {
      setFeedback("Unable to update Favorites. Please try again.");
    } finally {
      setBusy((current) => {
        const updated = new Set(current);
        updated.delete(slug);
        return updated;
      });
    }
  }

  return (
    <div className={styles.library}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>LEARN SOMETHING NEW</span>
          <h1>Explore Library</h1>
          <p>
            Discover algorithms, data structures and key concepts, with explanations and
            visualizations.
          </p>
        </div>
        <div className={styles.headerArt} aria-hidden="true">
          <div className={styles.artGlow} />
          <div className={styles.bookStack}>
            <span className={styles.bookTop}>
              <span>‹/›</span>
            </span>
            <span className={styles.bookMiddle} />
            <span className={styles.bookBottom} />
          </div>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Library sections">
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "ALL" ? styles.tabActive : ""}`}
          onClick={() => setTypes(TYPES)}
        >
          <Glyph kind="grid" /> All Topics <span>{items.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "ALGORITHM" ? styles.tabActive : ""}`}
          onClick={() => setTypes(["ALGORITHM"])}
        >
          <Glyph kind="Sorting" /> Algorithms <span>{typeCounts.ALGORITHM}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "DATA_STRUCTURE" ? styles.tabActive : ""}`}
          onClick={() => setTypes(["DATA_STRUCTURE"])}
        >
          <Glyph kind="Others" /> Data Structures <span>{typeCounts.DATA_STRUCTURE}</span>
        </button>
        <button
          type="button"
          className={styles.tab}
          onClick={() =>
            categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          <Glyph kind="filter" /> By Category <Glyph kind="chevron" />
        </button>
      </nav>

      <div className={styles.layout}>
        <aside
          className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}
          aria-label="Library filters"
        >
          <div className={styles.filtersHeader}>
            <div>
              <Glyph kind="filter" />
              <strong>Filters</strong>
            </div>
            <button type="button" onClick={resetFilters}>
              Clear all
            </button>
          </div>
          <div className={styles.filterGroup}>
            <h3>Difficulty</h3>
            {difficultyCounts.map(({ name, count }) => (
              <label className={styles.checkRow} key={name}>
                <input
                  type="checkbox"
                  checked={difficulties.includes(name)}
                  onChange={() => toggleValue(setDifficulties, name)}
                />
                <span>{toTitle(name)}</span>
                <small>{count}</small>
              </label>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <h3>Topic Type</h3>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={types.includes("ALGORITHM")}
                onChange={() => toggleValue(setTypes, "ALGORITHM")}
              />
              <span>Algorithm</span>
              <small>{typeCounts.ALGORITHM}</small>
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={types.includes("DATA_STRUCTURE")}
                onChange={() => toggleValue(setTypes, "DATA_STRUCTURE")}
              />
              <span>Data Structure</span>
              <small>{typeCounts.DATA_STRUCTURE}</small>
            </label>
            <label
              className={`${styles.checkRow} ${styles.disabledFilter}`}
              title="Concept explanations are not currently published in the Explore catalog."
            >
              <input type="checkbox" disabled checked={false} readOnly />
              <span>Concept</span>
              <small>0</small>
            </label>
          </div>
          <div className={styles.filterGroup}>
            <h3>Category</h3>
            {categoryCounts.map(({ name, count }) => (
              <label className={styles.checkRow} key={name}>
                <input
                  type="checkbox"
                  checked={categories.includes(name)}
                  onChange={() => toggleValue(setCategories, name)}
                />
                <span>{name}</span>
                <small>{count}</small>
              </label>
            ))}
          </div>
          {hasFilters ? (
            <button type="button" className={styles.resetButton} onClick={resetFilters}>
              Reset filters
            </button>
          ) : null}
        </aside>

        <div className={styles.results}>
          <section
            className={styles.categorySection}
            ref={categoryRef}
            aria-labelledby="browse-category-title"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>FIND YOUR NEXT TOPIC</span>
                <h2 id="browse-category-title">Browse by Category</h2>
              </div>
              <button
                type="button"
                className={styles.mobileFilterButton}
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                <Glyph kind="filter" /> Filters
              </button>
            </div>
            <div className={styles.categoryGrid}>
              {categoryCards.map(({ name, count }) => {
                const isAllTopics = name === "All Topics";
                const active = isAllTopics ? categories.length === 0 : categories.includes(name);
                return (
                  <button
                    type="button"
                    key={name}
                    className={`${styles.categoryCard} ${active ? styles.categoryCardActive : ""}`}
                    onClick={() =>
                      isAllTopics ? setCategories([]) : toggleValue(setCategories, name)
                    }
                    aria-pressed={active}
                  >
                    <span
                      className={styles.categoryIcon}
                      data-category={name.toLowerCase().replace(/\s/g, "-")}
                    >
                      <Glyph kind={name} />
                    </span>
                    <strong>{name}</strong>
                    <small>
                      {count} {count === 1 ? "topic" : "topics"}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.topicSection} aria-labelledby="all-topics-title">
            <div className={styles.topicToolbar}>
              <div>
                <h2 id="all-topics-title">
                  All Topics <span>({results.length})</span>
                </h2>
                <p>Choose a topic to open its learning space.</p>
              </div>
              <div className={styles.toolbarControls}>
                <label className={styles.sortControl}>
                  <span>Sort by</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortMode)}
                  >
                    <option value="CURATED">Curated order</option>
                    <option value="AZ">A–Z</option>
                    <option value="BEGINNER">Beginner first</option>
                    <option value="ADVANCED">Advanced first</option>
                  </select>
                </label>
                <div className={styles.viewToggle} role="group" aria-label="Topic view">
                  <button
                    type="button"
                    className={!listView ? styles.viewActive : ""}
                    onClick={() => setListView(false)}
                    aria-label="Grid view"
                    aria-pressed={!listView}
                  >
                    <Glyph kind="grid" />
                  </button>
                  <button
                    type="button"
                    className={listView ? styles.viewActive : ""}
                    onClick={() => setListView(true)}
                    aria-label="List view"
                    aria-pressed={listView}
                  >
                    <Glyph kind="list" />
                  </button>
                </div>
              </div>
            </div>

            {feedback ? (
              <p className={styles.feedback} role="status">
                {feedback}
              </p>
            ) : null}
            {results.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Glyph kind="search" />
                </span>
                <h3>No topics found</h3>
                <p>Try changing your search or removing one of the active filters.</p>
                <button type="button" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={`${styles.topicGrid} ${listView ? styles.topicList : ""}`}>
                {results.map((item) => {
                  const category = getCategory(item);
                  const favorite = favorites.has(item.metadata.slug);
                  const href = detailHref(item);
                  return (
                    <article
                      className={styles.topicCard}
                      key={`${item.metadata.type}:${item.metadata.slug}`}
                    >
                      <div className={styles.topicCardTop}>
                        <span
                          className={styles.topicIcon}
                          data-category={category.toLowerCase().replace(/\s/g, "-")}
                        >
                          <Glyph kind={category} />
                        </span>
                        <button
                          type="button"
                          className={`${styles.bookmarkButton} ${favorite ? styles.bookmarkActive : ""}`}
                          onClick={() => void toggleFavorite(item.metadata.slug)}
                          disabled={busy.has(item.metadata.slug)}
                          aria-label={
                            favorite
                              ? `Remove ${item.metadata.title} from Favorites`
                              : `Add ${item.metadata.title} to Favorites`
                          }
                          aria-pressed={favorite}
                          title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Glyph kind="bookmark" />
                        </button>
                      </div>
                      <div className={styles.topicCardContent}>
                        <span className={styles.topicKind}>
                          {item.metadata.type === "ALGORITHM" ? "ALGORITHM" : "DATA STRUCTURE"}
                        </span>
                        <h3>
                          <Link href={href}>{item.metadata.title}</Link>
                        </h3>
                        <p>{item.metadata.summary}</p>
                      </div>
                      <div className={styles.topicCardFooter}>
                        <div className={styles.topicBadges}>
                          <span
                            className={styles.categoryBadge}
                            data-category={category.toLowerCase().replace(/\s/g, "-")}
                          >
                            {category}
                          </span>
                          <span
                            className={styles.difficultyBadge}
                            data-difficulty={item.metadata.difficulty.toLowerCase()}
                          >
                            {toTitle(item.metadata.difficulty)}
                          </span>
                        </div>
                        <Link
                          className={styles.openTopic}
                          href={href}
                          aria-label={`Open ${item.metadata.title}`}
                        >
                          <Glyph kind="arrow" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
