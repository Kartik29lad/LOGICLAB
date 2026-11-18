import type { ReactNode } from "react";
import Link from "next/link";

import { absoluteUrl, canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CONTENT, getDiscoveryContent } from "@/content/discovery";
import { JsonLd } from "@/components/seo/json-ld";

import styles from "./home-dashboard.module.css";

export const metadata = canonicalMetadata("/", {
  title: "Interactive Algorithms & Data Structures Learning Lab",
  description:
    "Learn algorithms and data structures through interactive visualizations, step-by-step explanations, complexity analysis, and practice challenges.",
});

type DashboardIconName =
  | "book"
  | "flask"
  | "target"
  | "compare"
  | "arrow"
  | "layers"
  | "network"
  | "search"
  | "tree"
  | "chart"
  | "clock"
  | "chevron";

function DashboardIcon({ name }: Readonly<{ name: DashboardIconName }>) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  const paths: Record<DashboardIconName, ReactNode> = {
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
        <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h7" />
      </>
    ),
    flask: (
      <>
        <path d="M9 3h6M10 3v6l-5.8 9.2A2 2 0 0 0 5.9 21h12.2a2 2 0 0 0 1.7-2.8L14 9V3" />
        <path d="M8 15h8" />
      </>
    ),
    target: (
      <>
        <circle cx="11" cy="13" r="8" />
        <circle cx="11" cy="13" r="4" />
        <path d="m21 3-7.5 7.5M16 3h5v5" />
      </>
    ),
    compare: (
      <>
        <path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="18" r="2.5" />
        <circle cx="19" cy="18" r="2.5" />
        <path d="m10.8 7.2-4.5 8.5m6.9-8.5 4.5 8.5M7.5 18h9" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </>
    ),
    tree: (
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M12 7.5v4.2M12 11.7 6 15.5m6-3.8 6 3.8" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V11m5 9V5m5 15v-7m5 7V8M2 20h20" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function HomePage() {
  const algorithms = getDiscoveryContent("ALGORITHM");
  const dataStructures = getDiscoveryContent("DATA_STRUCTURE");
  const learningPaths = DISCOVERY_CONTENT.filter(
    (item) => item.metadata.type === "LEARNING_PATH" && item.metadata.isActive
  ).sort((a, b) => (a.learningPath?.order ?? 99) - (b.learningPath?.order ?? 99));

  const catalogItems = [...algorithms, ...dataStructures];
  const categoryMap = new Map<string, { count: number; hasAlgorithm: boolean }>();
  for (const item of catalogItems) {
    const category = item.metadata.category;
    const current = categoryMap.get(category) ?? { count: 0, hasAlgorithm: false };
    categoryMap.set(category, {
      count: current.count + 1,
      hasAlgorithm: current.hasAlgorithm || item.metadata.type === "ALGORITHM",
    });
  }
  const categories = [...categoryMap.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .slice(0, 5);

  const featuredPath = learningPaths[0];
  const popularTopics = ["bubble-sort", "binary-search", "bfs", "binary-search-tree"]
    .map((slug) => catalogItems.find((item) => item.metadata.slug === slug))
    .filter((item): item is (typeof catalogItems)[number] => Boolean(item));

  return (
    <div className={styles.dashboard}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LogicLab",
          url: absoluteUrl("/"),
          description: "Interactive algorithm and data-structure learning laboratory.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <section className={styles.welcome} aria-labelledby="home-title">
        <div className={styles.welcomeCopy}>
          <span className={styles.eyebrow}>Your interactive learning space</span>
          <h1 id="home-title">Explore. Visualize. Understand.</h1>
          <p>
            Build a stronger understanding of algorithms and data structures through guided lessons,
            interactive experiments, and hands-on practice.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          <Link className={styles.primaryAction} href="/algorithms">
            Explore library <DashboardIcon name="arrow" />
          </Link>
          <Link className={styles.secondaryAction} href="/visualizer">
            <DashboardIcon name="flask" /> Open interactive lab
          </Link>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.panel} aria-labelledby="featured-path-title">
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>A good place to start</span>
                <h2 id="featured-path-title">Start your learning journey</h2>
                <p>Follow a structured path instead of learning concepts in isolation.</p>
              </div>
              <Link className={styles.textLink} href="/learning-paths">
                All paths <DashboardIcon name="arrow" />
              </Link>
            </div>
            {featuredPath ? (
              <div className={styles.featuredPath}>
                <div className={styles.featuredIcon} aria-hidden="true">
                  <DashboardIcon name="layers" />
                </div>
                <div className={styles.featuredContent}>
                  <h3>{featuredPath.metadata.title}</h3>
                  <p>{featuredPath.metadata.summary}</p>
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>
                      {titleCase(featuredPath.metadata.difficulty)}
                    </span>
                    <span className={styles.metaPill}>
                      {featuredPath.learningPath?.itemSlugs.length ?? 0} learning topics
                    </span>
                  </div>
                </div>
                <Link
                  className={`${styles.primaryAction} ${styles.featuredAction}`}
                  href={`/learning-paths/${featuredPath.metadata.slug}`}
                >
                  View learning path <DashboardIcon name="arrow" />
                </Link>
              </div>
            ) : (
              <p className={styles.emptyHint}>Learning paths will appear here when available.</p>
            )}
          </section>

          <section className={styles.quickSection} aria-labelledby="quick-actions-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 id="quick-actions-title">What would you like to do?</h2>
                <p>Jump straight into the activity you have in mind.</p>
              </div>
            </div>
            <div className={styles.quickGrid}>
              <Link className={styles.quickAction} href="/algorithms">
                <span className={styles.quickIcon} aria-hidden="true">
                  <DashboardIcon name="book" />
                </span>
                <strong>Learn a concept</strong>
                <span>Explore algorithms and data structures.</span>
              </Link>
              <Link className={styles.quickAction} href="/visualizer">
                <span className={styles.quickIcon} aria-hidden="true">
                  <DashboardIcon name="flask" />
                </span>
                <strong>Experiment</strong>
                <span>Run an algorithm and inspect each step.</span>
              </Link>
              <Link className={styles.quickAction} href="/challenges">
                <span className={styles.quickIcon} aria-hidden="true">
                  <DashboardIcon name="target" />
                </span>
                <strong>Practice</strong>
                <span>Apply what you know with challenges.</span>
              </Link>
              <Link className={styles.quickAction} href="/compare">
                <span className={styles.quickIcon} aria-hidden="true">
                  <DashboardIcon name="compare" />
                </span>
                <strong>Compare</strong>
                <span>Understand algorithm trade-offs.</span>
              </Link>
            </div>
          </section>

          <section className={styles.exploreSection} aria-labelledby="explore-topics-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 id="explore-topics-title">Explore topics</h2>
                <p>Choose a subject and discover the concepts inside it.</p>
              </div>
              <Link className={styles.textLink} href="/algorithms">
                Browse all <DashboardIcon name="arrow" />
              </Link>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map(([category, details]) => (
                <Link
                  className={styles.categoryCard}
                  href={`${details.hasAlgorithm ? "/algorithms" : "/data-structures"}?category=${encodeURIComponent(category)}`}
                  key={category}
                >
                  <span className={styles.categoryTop}>
                    <DashboardIcon
                      name={
                        category.toLowerCase().includes("graph")
                          ? "network"
                          : category.toLowerCase().includes("tree")
                            ? "tree"
                            : category.toLowerCase().includes("search")
                              ? "search"
                              : category.toLowerCase().includes("sort")
                                ? "chart"
                                : "layers"
                      }
                    />
                    <span className={styles.categoryCount}>{details.count} topics</span>
                  </span>
                  <strong>{titleCase(category)}</strong>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.sideColumn} aria-label="Learning overview">
          <section className={styles.panel} aria-labelledby="learning-paths-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="learning-paths-title">Learning paths</h2>
                <p>Structured routes through related concepts.</p>
              </div>
              <Link
                className={styles.textLink}
                href="/learning-paths"
                aria-label="View all learning paths"
              >
                View all <DashboardIcon name="arrow" />
              </Link>
            </div>
            {learningPaths.length > 0 ? (
              <div className={styles.pathList}>
                {learningPaths.map((path) => (
                  <Link
                    className={styles.pathLink}
                    href={`/learning-paths/${path.metadata.slug}`}
                    key={path.metadata.slug}
                  >
                    <span className={styles.pathIcon} aria-hidden="true">
                      <DashboardIcon name="layers" />
                    </span>
                    <span className={styles.pathText}>
                      <strong>{path.metadata.title}</strong>
                      <span>
                        {path.learningPath?.itemSlugs.length ?? 0} topics ·{" "}
                        {titleCase(path.metadata.difficulty)}
                      </span>
                    </span>
                    <span className={styles.pathArrow} aria-hidden="true">
                      <DashboardIcon name="chevron" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.emptyHint}>No learning paths are available yet.</p>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="library-overview-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="library-overview-title">Your learning library</h2>
                <p>Available content across LogicLab.</p>
              </div>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon} aria-hidden="true">
                  <DashboardIcon name="chart" />
                </span>
                <div>
                  <div className={styles.statValue}>{algorithms.length}</div>
                  <div className={styles.statLabel}>Algorithms</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon} aria-hidden="true">
                  <DashboardIcon name="layers" />
                </span>
                <div>
                  <div className={styles.statValue}>{dataStructures.length}</div>
                  <div className={styles.statLabel}>Data structures</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon} aria-hidden="true">
                  <DashboardIcon name="book" />
                </span>
                <div>
                  <div className={styles.statValue}>{learningPaths.length}</div>
                  <div className={styles.statLabel}>Learning paths</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon} aria-hidden="true">
                  <DashboardIcon name="network" />
                </span>
                <div>
                  <div className={styles.statValue}>{categoryMap.size}</div>
                  <div className={styles.statLabel}>Topic groups</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="popular-topics-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="popular-topics-title">Good places to start</h2>
                <p>Explore a few core concepts.</p>
              </div>
            </div>
            <div className={styles.topicList}>
              {popularTopics.map((item) => (
                <Link
                  className={styles.topicCard}
                  href={`/${item.metadata.type === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.metadata.slug}`}
                  key={item.metadata.slug}
                >
                  <span>
                    <strong>{item.metadata.title}</strong>
                    <span>
                      {titleCase(item.metadata.category)} · {titleCase(item.metadata.difficulty)}
                    </span>
                  </span>
                  <em aria-hidden="true">
                    <DashboardIcon name="chevron" />
                  </em>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
