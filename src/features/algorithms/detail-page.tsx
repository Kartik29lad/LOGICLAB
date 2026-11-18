import Link from "next/link";

import { getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";
import type { ContentPackage, ContentRelationship } from "@/content/schema/content-types";
import { ContentActions } from "@/features/activity/content-actions";

import styles from "./detail-page.module.css";

type IconName =
  | "book"
  | "search"
  | "layers"
  | "play"
  | "code"
  | "chart"
  | "clock"
  | "target"
  | "bookmark"
  | "arrow"
  | "chevron"
  | "check"
  | "lightbulb"
  | "home"
  | "list"
  | "bolt"
  | "network";

function Icon({ name, size = 18 }: Readonly<{ name: IconName; size?: number }>) {
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
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
          <path d="M4 5.5V22M8 7h8M8 11h8" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m8 5 11 7-11 7z" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V11h4v9M10 20V5h4v15M16 20v-8h4v8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 22h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.8.7-1.2 1.4-1.3 2.5h-4.4c-.1-1.1-.5-1.8-1.3-2.5Z" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M9 6h11M9 12h11M9 18h11" />
          <path d="M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 5 13h6l-1 9 9-13h-6l0-7Z" />
        </svg>
      );
    case "network":
      return (
        <svg {...common}>
          <path d="m12 5-7 13h14L12 5Z" />
          <circle cx="12" cy="5" r="2.2" />
          <circle cx="5" cy="18" r="2.2" />
          <circle cx="19" cy="18" r="2.2" />
        </svg>
      );
  }
}

function getRelatedItems(item: ContentPackage): Array<{
  item: ContentPackage;
  relationship: ContentRelationship["relationship"];
}> {
  return item.metadata.relatedContent
    .map((relation) => {
      const related = getDiscoveryItem(relation.slug);
      return related ? { item: related, relationship: relation.relationship } : null;
    })
    .filter(
      (
        value
      ): value is { item: ContentPackage; relationship: ContentRelationship["relationship"] } =>
        Boolean(value)
    );
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "Not provided";
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function readTime(item: ContentPackage): number {
  if (item.metadata.slug === "binary-search") return 15;
  const source = [
    item.metadata.title,
    item.metadata.description,
    item.explanation,
    item.metadata.mainIdea ?? "",
    ...(item.metadata.howItWorks ?? []),
    ...(item.metadata.learningObjectives ?? []),
  ].join(" ");
  return Math.max(1, Math.ceil(source.trim().split(/\s+/).filter(Boolean).length / 190));
}

function topicRoute(item: ContentPackage): string {
  return item.metadata.type === "ALGORITHM"
    ? `/algorithms/${item.metadata.slug}`
    : `/data-structures/${item.metadata.slug}`;
}

function TopicIllustration({ item }: Readonly<{ item: ContentPackage }>) {
  const isSearch = item.metadata.category.toLowerCase().includes("search");
  const isGraph = item.metadata.visualizationType?.toLowerCase() === "graph";
  const isTree = item.metadata.visualizationType?.toLowerCase() === "tree";

  return (
    <div className={styles.heroIllustration} aria-hidden="true">
      <svg className={styles.heroArtwork} viewBox="0 0 330 176" fill="none" role="presentation">
        <defs>
          <linearGradient
            id="topic-floor"
            x1="28"
            y1="42"
            x2="292"
            y2="166"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#153E49" stopOpacity=".82" />
            <stop offset="1" stopColor="#0A2029" stopOpacity=".22" />
          </linearGradient>
          <linearGradient id="topic-cube-top" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#357F9A" />
            <stop offset="1" stopColor="#1D526B" />
          </linearGradient>
          <linearGradient id="topic-cube-left" x1="0" y1="0" x2="0.9" y2="1">
            <stop stopColor="#23677D" />
            <stop offset="1" stopColor="#123C4D" />
          </linearGradient>
          <linearGradient id="topic-cube-right" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#1B536B" />
            <stop offset="1" stopColor="#0D2D3B" />
          </linearGradient>
          <linearGradient id="topic-search-face" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#1C777A" />
            <stop offset="1" stopColor="#10434F" />
          </linearGradient>
          <linearGradient
            id="topic-lens-stroke"
            x1="145"
            y1="48"
            x2="191"
            y2="104"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A7FFF8" />
            <stop offset="1" stopColor="#45D8D0" />
          </linearGradient>
          <filter id="topic-lens-glow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.16 0 0 0 0 0.78 0 0 0 0 0.75 0 0 0 0.38 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Restrained perspective floor, matching the reference's isometric stage. */}
        <path d="M15 128 163 39 318 112 169 174 15 128Z" fill="url(#topic-floor)" />
        <g stroke="#55DCD4" strokeOpacity=".2" strokeWidth=".9">
          <path d="m25 129 140-82 143 68M49 140l141-82M75 151l141-82M102 162l141-82M130 171l141-82" />
          <path d="m45 110 146 70M76 91l146 71M108 72l145 71M140 53l145 71" />
        </g>
        <path d="M19 128 164 42 313 112" stroke="#62E3DB" strokeOpacity=".44" strokeWidth="1.25" />

        {/* Floating data tiles receding into the right side of the scene. */}
        <g strokeLinejoin="round">
          <path
            d="m220 57 24-14 26 14-24 14-26-14Z"
            fill="url(#topic-cube-top)"
            stroke="#579FB4"
            strokeOpacity=".72"
          />
          <path
            d="m220 57 26 14v17l-26-14V57Z"
            fill="url(#topic-cube-left)"
            stroke="#357F92"
            strokeOpacity=".65"
          />
          <path
            d="m246 71 24-14v17l-24 14V71Z"
            fill="url(#topic-cube-right)"
            stroke="#2A7185"
            strokeOpacity=".68"
          />

          <path
            d="m254 85 20-12 23 12-20 12-23-12Z"
            fill="url(#topic-cube-top)"
            stroke="#579FB4"
            strokeOpacity=".65"
          />
          <path
            d="m254 85 23 12v14l-23-12V85Z"
            fill="url(#topic-cube-left)"
            stroke="#357F92"
            strokeOpacity=".6"
          />
          <path
            d="m277 97 20-12v14l-20 12V97Z"
            fill="url(#topic-cube-right)"
            stroke="#2A7185"
            strokeOpacity=".6"
          />

          <path
            d="m204 91 20-12 23 12-20 12-23-12Z"
            fill="url(#topic-cube-top)"
            stroke="#579FB4"
            strokeOpacity=".55"
          />
          <path
            d="m204 91 23 12v13l-23-12V91Z"
            fill="url(#topic-cube-left)"
            stroke="#357F92"
            strokeOpacity=".52"
          />
          <path
            d="m227 103 20-12v13l-20 12v-13Z"
            fill="url(#topic-cube-right)"
            stroke="#2A7185"
            strokeOpacity=".55"
          />
        </g>

        {isSearch ? (
          <g filter="url(#topic-lens-glow)">
            {/* Raised search tile */}
            <path
              d="m91 94 71-42 75 39-72 44-74-41Z"
              fill="#0D2B35"
              fillOpacity=".94"
              stroke="#4DD8D1"
              strokeOpacity=".42"
            />
            <path
              d="m111 91 51-30 54 29-52 31-53-30Z"
              fill="url(#topic-search-face)"
              stroke="#79F0E8"
              strokeWidth="1.35"
            />
            <path
              d="m111 91 53 30v19l-53-30V91Z"
              fill="#155263"
              stroke="#398D98"
              strokeOpacity=".75"
            />
            <path
              d="m164 121 52-31v19l-52 31v-19Z"
              fill="#0F3A49"
              stroke="#286E7F"
              strokeOpacity=".8"
            />
            {/* Large, crisp magnifying glass */}
            <circle
              cx="164"
              cy="81"
              r="19"
              fill="#0B303A"
              stroke="url(#topic-lens-stroke)"
              strokeWidth="4.2"
            />
            <circle
              cx="164"
              cy="81"
              r="12.6"
              stroke="#B9FFF9"
              strokeOpacity=".68"
              strokeWidth="1.15"
            />
            <path d="m178 95 18 18" stroke="#55DED6" strokeWidth="6.5" strokeLinecap="round" />
            <path
              d="m178 95 18 18"
              stroke="#C0FFFA"
              strokeOpacity=".82"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="m43 119 43-25"
              stroke="#55DCD4"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeOpacity=".72"
            />
            <path
              d="m55 128 26-15"
              stroke="#55DCD4"
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity=".38"
            />
          </g>
        ) : isGraph ? (
          <g filter="url(#topic-lens-glow)" stroke="#75E9E1" strokeWidth="2.5">
            <path d="m166 38-49 56 99 17-50-73Z" strokeOpacity=".78" />
            <circle cx="166" cy="38" r="8.5" fill="#164A55" />
            <circle cx="117" cy="94" r="8.5" fill="#164A55" />
            <circle cx="216" cy="111" r="8.5" fill="#164A55" />
          </g>
        ) : isTree ? (
          <g filter="url(#topic-lens-glow)" stroke="#75E9E1" strokeWidth="2.5">
            <path d="M166 34v39m0 0-46 34m46-34 46 34" strokeOpacity=".78" />
            <circle cx="166" cy="34" r="9" fill="#164A55" />
            <circle cx="120" cy="107" r="9" fill="#164A55" />
            <circle cx="212" cy="107" r="9" fill="#164A55" />
          </g>
        ) : (
          <g filter="url(#topic-lens-glow)">
            <rect
              x="143"
              y="48"
              width="46"
              height="46"
              rx="9"
              fill="#103C48"
              stroke="#68E9E0"
              strokeWidth="1.8"
              transform="rotate(-8 166 71)"
            />
            <path
              d="m155 62-6 6 6 6m21-12 6 6-6 6m-5-19-8 25"
              stroke="#80F0E8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        <path
          d="m274 28 25-15"
          stroke="#52D5CE"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeOpacity=".8"
        />
        <circle cx="300" cy="12" r="2.3" fill="#78EEE6" />
        <circle cx="34" cy="76" r="2" fill="#58DAD2" fillOpacity=".62" />
      </svg>
    </div>
  );
}

function getDisplaySteps(item: ContentPackage): string[] {
  if (item.metadata.slug === "binary-search") {
    return [
      "Start with two pointers: low (start) and high (end).",
      "Find the middle index: mid = (low + high) / 2.",
      "Compare the middle element with the target.",
      "If equal, return the index.",
      "If target is smaller, search the left half.",
      "If target is larger, search the right half.",
    ];
  }

  return item.metadata.howItWorks?.length
    ? item.metadata.howItWorks
    : item.metadata.learningObjectives;
}

function BinarySearchWalkthrough() {
  const values = [2, 5, 8, 12, 16, 23, 38];

  return (
    <div
      className={styles.binaryWalkthrough}
      role="img"
      aria-label="Binary search example: sorted array 2, 5, 8, 12, 16, 23, 38. Low points to 2, mid points to 12, and high points to 38. The target is 12."
    >
      <div className={styles.binaryWalkthroughHeader}>
        <span className={styles.binaryStepPill}>Step 3:</span>
        <strong>Compare mid with target</strong>
      </div>
      <div className={styles.binaryArray}>
        {values.map((value, index) => (
          <span
            className={index === 3 ? styles.binaryArrayActive : styles.binaryArrayCell}
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
      <div className={styles.binaryPointers}>
        {values.map((value, index) => (
          <span className={styles.binaryPointer} key={value}>
            {index === 0 || index === 3 || index === 6 ? (
              <>
                <span className={styles.pointerArrow}>↑</span>
                <span className={index === 3 ? styles.pointerMid : styles.pointerLabel}>
                  {index === 0 ? "low" : index === 3 ? "mid" : "high"}
                </span>
              </>
            ) : null}
          </span>
        ))}
      </div>
      <div className={styles.binaryArraySummary}>
        <code>array = [2, 5, 8, 12, 16, 23, 38]</code>
        <span>
          target = <strong>12</strong>
        </span>
      </div>
    </div>
  );
}

export function DiscoveryDetail({
  item,
  type,
}: Readonly<{ item: ContentPackage; type: "algorithms" | "data-structures" }>) {
  const declaredRelated = getRelatedItems(item).filter(
    ({ relationship }) => relationship === "RELATED" || relationship === "ALTERNATIVE"
  );
  const siblingType = item.metadata.type === "ALGORITHM" ? "ALGORITHM" : "DATA_STRUCTURE";
  const sameCategoryTopics = getDiscoveryContent(siblingType)
    .filter(
      (candidate) =>
        candidate.metadata.slug !== item.metadata.slug &&
        candidate.metadata.category.toLowerCase() === item.metadata.category.toLowerCase()
    )
    .map((candidate) => ({ item: candidate, relationship: "RELATED" as const }));
  const prerequisites = item.metadata.prerequisites
    .map((slug) => getDiscoveryItem(slug))
    .filter((value): value is ContentPackage => Boolean(value));
  const related = [...declaredRelated];
  for (const candidate of [
    ...sameCategoryTopics,
    ...prerequisites.map((prerequisite) => ({
      item: prerequisite,
      relationship: "PREREQUISITE" as const,
    })),
  ]) {
    if (
      !related.some(
        ({ item: relatedItem }) => relatedItem.metadata.slug === candidate.item.metadata.slug
      )
    ) {
      related.push(candidate);
    }
  }
  const referenceSearchSuggestions = [
    {
      slug: "linear-search",
      title: "Linear Search",
      difficulty: "Beginner",
      icon: "search" as const,
    },
    {
      slug: "ternary-search",
      title: "Ternary Search",
      difficulty: "Intermediate",
      icon: "network" as const,
    },
    {
      slug: "jump-search",
      title: "Jump Search",
      difficulty: "Intermediate",
      icon: "layers" as const,
    },
    {
      slug: "exponential-search",
      title: "Exponential Search",
      difficulty: "Advanced",
      icon: "bolt" as const,
    },
  ];
  const relatedCards =
    item.metadata.slug === "binary-search"
      ? referenceSearchSuggestions.map((suggestion) => ({
          ...suggestion,
          content: getDiscoveryItem(suggestion.slug),
        }))
      : related.slice(0, 4).map(({ item: relatedItem, relationship }) => ({
          slug: relatedItem.metadata.slug,
          title: relatedItem.metadata.title,
          difficulty: relatedItem.metadata.difficulty.toLowerCase(),
          icon: relatedItem.metadata.category.toLowerCase().includes("search")
            ? ("search" as const)
            : relatedItem.metadata.visualizationType === "graph"
              ? ("target" as const)
              : ("layers" as const),
          content: relatedItem,
          relationship,
        }));

  const playgroundHref = item.metadata.visualizationType
    ? `/visualizer/${item.metadata.slug}`
    : item.metadata.category.toLowerCase().includes("graph")
      ? "/playground/graph"
      : item.metadata.category.toLowerCase().includes("tree")
        ? "/playground/tree"
        : null;
  const readMinutes = readTime(item);
  const overviewText =
    item.metadata.slug === "binary-search"
      ? "Binary Search is a divide-and-conquer search algorithm that works on a sorted array. It repeatedly compares the middle element with the target value and reduces the search space by half."
      : (item.metadata.mainIdea ?? item.explanation);
  const heroDescription =
    item.metadata.slug === "binary-search"
      ? "An efficient algorithm to search for an element in a sorted array by repeatedly dividing the search space in half."
      : item.metadata.description;
  const steps = getDisplaySteps(item);
  const hasPseudocode = Boolean(item.pseudocode);
  const hasImplementationCode = Boolean(item.code?.length);
  const hasCode = hasPseudocode || hasImplementationCode;
  const hasExamples = Boolean(item.metadata.examples.length);
  const hasPractice = Boolean(item.challenge || item.metadata.practiceReferences?.length);

  const topicSections = [
    { id: "overview", label: `What is ${item.metadata.title}?`, icon: "book" as const },
    ...(steps.length
      ? [{ id: "how-it-works", label: "How it Works", icon: "layers" as const }]
      : []),
    ...(item.metadata.complexity
      ? [{ id: "complexity", label: "Time & Space Complexity", icon: "chart" as const }]
      : []),
    ...(hasPseudocode
      ? [{ id: "pseudocode", label: "Algorithm (Pseudocode)", icon: "code" as const }]
      : []),
    ...(hasImplementationCode
      ? [{ id: "code", label: "Code Implementation", icon: "code" as const }]
      : []),
    ...(hasExamples ? [{ id: "examples", label: "Examples", icon: "list" as const }] : []),
    ...(item.metadata.learningObjectives.length
      ? [{ id: "takeaways", label: "Key Takeaways", icon: "check" as const }]
      : []),
  ];

  return (
    <article className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <div className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" aria-label="Home">
              <Icon name="home" size={17} />
            </Link>
            <Icon name="chevron" size={14} />
            <Link href="/algorithms">Explore</Link>
            <Icon name="chevron" size={14} />
            <Link href={`/${type}`}>{item.metadata.category}</Link>
            <Icon name="chevron" size={14} />
            <span aria-current="page">{item.metadata.title}</span>
          </div>

          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <div className={styles.topicIcon}>
                <Icon
                  name={
                    item.metadata.category.toLowerCase().includes("search")
                      ? "search"
                      : item.metadata.type === "DATA_STRUCTURE"
                        ? "layers"
                        : "chart"
                  }
                  size={43}
                />
              </div>
              <div className={styles.heroText}>
                <h1>{item.metadata.title}</h1>
                <p>{heroDescription}</p>
                <div className={styles.metaRow}>
                  <span className={styles.categoryBadge}>{item.metadata.category}</span>
                  <span className={styles.difficultyBadge}>
                    {item.metadata.difficulty.toLowerCase()}
                  </span>
                  <span className={styles.readTime}>
                    <Icon name="clock" size={16} /> ~ {readMinutes} min read
                  </span>
                </div>
              </div>
            </div>
            <TopicIllustration item={item} />
          </header>

          <nav className={styles.sectionNav} aria-label="Topic sections">
            <a className={styles.sectionNavActive} href="#overview">
              <Icon name="book" />
              Overview
            </a>
            {playgroundHref ? (
              <Link href={playgroundHref}>
                <Icon name="target" />
                Visualization
              </Link>
            ) : null}
            {hasCode ? (
              <a href={hasPseudocode ? "#pseudocode" : "#code"}>
                <Icon name="code" />
                Code
              </a>
            ) : null}
            {item.metadata.complexity ? (
              <a href="#complexity">
                <Icon name="chart" />
                Complexity
              </a>
            ) : null}
            {hasExamples ? (
              <a href="#examples">
                <Icon name="layers" />
                Examples
              </a>
            ) : null}
            {hasPractice ? (
              <a href="#practice">
                <Icon name="target" />
                Practice
              </a>
            ) : null}
          </nav>

          <section className={styles.contentCard} id="overview">
            <div className={`${styles.sectionHeading} ${styles.referenceHeading}`}>
              <h2>What is {item.metadata.title}?</h2>
            </div>
            <p className={styles.lead}>{overviewText}</p>
            {item.metadata.slug !== "binary-search" && item.explanation !== overviewText ? (
              <p className={styles.bodyCopy}>{item.explanation}</p>
            ) : null}
          </section>

          {steps.length ? (
            <section className={`${styles.contentCard} ${styles.howCard}`} id="how-it-works">
              <div className={`${styles.sectionHeading} ${styles.referenceHeading}`}>
                <h2>How it Works</h2>
              </div>
              <div className={styles.howLayout}>
                <ol className={styles.stepsList}>
                  {steps.map((step, index) => (
                    <li key={`${index}-${step}`}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className={styles.conceptPanel}>
                  {item.metadata.slug !== "binary-search" ? (
                    <div className={styles.conceptPanelHeader}>
                      <span>Concept map</span>
                      <span className={styles.liveDot}>Content model</span>
                    </div>
                  ) : null}
                  {item.metadata.slug === "binary-search" ? (
                    <BinarySearchWalkthrough />
                  ) : item.visualization?.states.length ? (
                    <>
                      <div className={styles.stateTrack}>
                        {item.visualization.states.slice(0, 6).map((state, index) => (
                          <div
                            className={
                              index === Math.floor(item.visualization!.states.length / 2)
                                ? styles.stateNodeActive
                                : styles.stateNode
                            }
                            key={state}
                          >
                            <span>{state.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.stateNote}>
                        Visualization states defined for this topic
                      </div>
                    </>
                  ) : item.metadata.terminology?.length ? (
                    <div className={styles.termList}>
                      {item.metadata.terminology.slice(0, 3).map((term) => (
                        <div key={term.term}>
                          <strong>{term.term}</strong>
                          <span>{term.definition}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.conceptFallback}>
                      <Icon name="lightbulb" size={25} />
                      <span>{item.metadata.mainIdea ?? item.metadata.description}</span>
                    </div>
                  )}
                  {item.metadata.slug !== "binary-search" && item.metadata.whyItWorks ? (
                    <div className={styles.whyBox}>
                      <strong>Why it works</strong>
                      <p>{item.metadata.whyItWorks}</p>
                    </div>
                  ) : null}
                  {item.metadata.slug !== "binary-search" && item.metadata.formulas?.length ? (
                    <div className={styles.formulaList}>
                      {item.metadata.formulas.slice(0, 2).map((formula) => (
                        <code key={formula}>{formula}</code>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {item.metadata.complexity ? (
            <section className={styles.contentCard} id="complexity">
              <div className={`${styles.sectionHeading} ${styles.referenceHeading}`}>
                <h2>Time &amp; Space Complexity</h2>
              </div>
              <div className={styles.complexityCards}>
                <div className={styles.complexityCard}>
                  <span className={styles.complexityIcon}>
                    <Icon name="clock" size={25} />
                  </span>
                  <div className={styles.complexityBody}>
                    <strong>Time Complexity</strong>
                    <b>{item.metadata.complexity.timeAverage}</b>
                    <span>
                      {item.metadata.slug === "binary-search"
                        ? "The search space is reduced by half in each step."
                        : "Average-case time required by the algorithm."}
                    </span>
                  </div>
                </div>
                <div className={styles.complexityCard}>
                  <span className={styles.complexityIcon}>
                    <Icon name="layers" size={25} />
                  </span>
                  <div className={styles.complexityBody}>
                    <strong>Space Complexity</strong>
                    <b>{item.metadata.complexity.space}</b>
                    <span>
                      {item.metadata.slug === "binary-search"
                        ? "Uses constant extra space (iterative approach)."
                        : "Additional memory used during execution."}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {hasPseudocode ? (
            <section className={styles.contentCard} id="pseudocode">
              <div className={`${styles.sectionHeading} ${styles.referenceHeading}`}>
                <h2>Algorithm (Pseudocode)</h2>
              </div>
              <div className={styles.codeBlock}>
                <div className={styles.codeBlockHeader}>
                  <span>Pseudocode</span>
                  <span>LogicLab</span>
                </div>
                <pre>{item.pseudocode}</pre>
              </div>
            </section>
          ) : null}

          {hasImplementationCode ? (
            <section className={styles.contentCard} id="code">
              <div className={`${styles.sectionHeading} ${styles.referenceHeading}`}>
                <h2>Code Implementation</h2>
              </div>
              {item.code?.map((reference) => (
                <details
                  className={styles.codeDetails}
                  key={`${reference.language}-${reference.entryPoint ?? "implementation"}`}
                >
                  <summary>
                    {reference.language.toUpperCase()} implementation <span>View code</span>
                  </summary>
                  <pre>{reference.source}</pre>
                </details>
              ))}
            </section>
          ) : null}

          {hasExamples ? (
            <section className={styles.contentCard} id="examples">
              <div className={styles.sectionHeading}>
                <span className={styles.sectionIcon}>
                  <Icon name="list" />
                </span>
                <div>
                  <span className={styles.sectionEyebrow}>Worked examples</span>
                  <h2>Examples</h2>
                </div>
              </div>
              <div className={styles.examplesGrid}>
                {item.metadata.examples.map((example) => (
                  <article className={styles.exampleCard} key={example.id}>
                    <h3>{example.title}</h3>
                    <p>{example.description}</p>
                    <div className={styles.exampleValues}>
                      <div>
                        <span>Input</span>
                        <code>{formatValue(example.input)}</code>
                      </div>
                      <div>
                        <span>Output</span>
                        <code>{formatValue(example.output)}</code>
                      </div>
                    </div>
                    {example.explanation ? (
                      <p className={styles.exampleExplanation}>{example.explanation}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {item.metadata.learningObjectives.length || item.metadata.commonMistakes.length ? (
            <section className={styles.contentCard} id="takeaways">
              <div className={styles.sectionHeading}>
                <span className={styles.sectionIcon}>
                  <Icon name="check" />
                </span>
                <div>
                  <span className={styles.sectionEyebrow}>Remember</span>
                  <h2>Key Takeaways</h2>
                </div>
              </div>
              {item.metadata.learningObjectives.length ? (
                <ul className={styles.takeawayList}>
                  {item.metadata.learningObjectives.map((objective) => (
                    <li key={objective}>
                      <Icon name="check" size={16} />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.metadata.commonMistakes.length ? (
                <div className={styles.mistakesBlock}>
                  <strong>Common mistakes to avoid</strong>
                  <ul>
                    {item.metadata.commonMistakes.map((mistake) => (
                      <li key={mistake}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {hasPractice ? (
            <section className={styles.contentCard} id="practice">
              <div className={styles.sectionHeading}>
                <span className={styles.sectionIcon}>
                  <Icon name="target" />
                </span>
                <div>
                  <span className={styles.sectionEyebrow}>Test your understanding</span>
                  <h2>Practice</h2>
                </div>
              </div>
              {item.challenge ? (
                <div className={styles.practicePreview}>
                  <strong>{item.challenge.question}</strong>
                  {item.challenge.hints.length ? <p>Hint: {item.challenge.hints[0]}</p> : null}
                </div>
              ) : null}
              <Link className={styles.secondaryAction} href="/challenges">
                Explore practice challenges <Icon name="arrow" size={16} />
              </Link>
            </section>
          ) : null}
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.sidebarCard}>
            <div className={styles.sidebarHeading}>
              <Icon name="chart" size={20} />
              <h2>In This Topic</h2>
            </div>
            <nav className={styles.topicToc} aria-label="On this page">
              {topicSections.map((section, index) => (
                <a
                  className={index === 0 ? styles.topicTocActive : ""}
                  href={`#${section.id}`}
                  key={section.id}
                >
                  <span className={styles.tocDot} />
                  {section.label}
                </a>
              ))}
            </nav>
            {playgroundHref ? (
              <Link className={styles.primaryAction} href={playgroundHref}>
                <Icon name="play" size={16} />
                Try in Interactive Lab <span>↗</span>
              </Link>
            ) : null}
            <Link className={styles.outlineAction} href="/challenges">
              <Icon name="target" size={16} />
              Solve Practice Problems <span>↗</span>
            </Link>
          </section>

          <section className={styles.sidebarCard}>
            <div className={`${styles.sidebarHeading} ${styles.sidebarHeadingWithAction}`}>
              <span>
                <Icon name="layers" size={20} />
                <h2>Related Topics</h2>
              </span>
              <Link className={styles.viewRelated} href={`/${type}`}>
                View All <Icon name="arrow" size={14} />
              </Link>
            </div>
            {relatedCards.length ? (
              <div className={styles.relatedList} role="list">
                {relatedCards.map((relatedItem) => {
                  const cardContent = (
                    <>
                      <span
                        className={`${styles.relatedIcon} ${relatedItem.icon === "bolt" ? styles.relatedIconWarning : ""}`}
                      >
                        <Icon name={relatedItem.icon} size={18} />
                      </span>
                      <span className={styles.relatedCopy}>
                        <strong>{relatedItem.title}</strong>
                      </span>
                      <span className={styles.relatedDifficulty}>{relatedItem.difficulty}</span>
                      <Icon name="chevron" size={15} />
                    </>
                  );

                  return relatedItem.content ? (
                    <Link
                      className={styles.relatedItem}
                      href={topicRoute(relatedItem.content)}
                      key={relatedItem.slug}
                      role="listitem"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div
                      className={`${styles.relatedItem} ${styles.relatedItemUnavailable}`}
                      key={relatedItem.slug}
                      role="listitem"
                      title="This topic is not published in the LogicLab library yet."
                      aria-label={`${relatedItem.title}, ${relatedItem.difficulty}, not yet available`}
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyRelated}>
                More related topics will appear as the library grows.
              </p>
            )}
          </section>

          <section className={styles.bookmarkCard}>
            <span className={styles.bookmarkIcon}>
              <Icon name="bookmark" size={20} />
            </span>
            <div className={styles.bookmarkCopy}>
              <strong>Bookmarks</strong>
              <span>Save this topic for later</span>
            </div>
            <ContentActions slug={item.metadata.slug} />
          </section>
        </aside>
      </div>
    </article>
  );
}
