"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

import {
  AlgorithmsIcon,
  BookmarksIcon,
  ChallengesIcon,
  DataStructuresIcon,
  HomeIcon,
  VisualizerIcon,
} from "@/components/navigation/icons";

import type { ChallengeDefinition, ChallengeEvaluation } from "../../core/challenges";
import styles from "./challenge-workspace.module.css";
import { CODE_CHALLENGES, type CodeChallenge } from "./code-challenges";
import { runCodeChallenge, type CodeRunResult } from "./code-runner";

type ChallengeCategory =
  "all" | "algorithms" | "data-structures" | "cybersecurity" | "system-design";
type DifficultyFilter = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type ProblemTab = "problem" | "examples" | "constraints";
type WorkspaceMode = "code" | "knowledge";

interface Props {
  challenges: readonly ChallengeDefinition[];
  initialChallengeId?: string;
}

const CATEGORY_LABELS: Record<Exclude<ChallengeCategory, "all">, string> = {
  algorithms: "Algorithms",
  "data-structures": "Data Structures",
  cybersecurity: "Cybersecurity",
  "system-design": "System Design",
};

const TOP_NAV = [
  { href: "/learning-paths", label: "Learn", icon: "learn" },
  { href: "/visualizer", label: "Visualizer", icon: "visualizer" },
  { href: "/challenges", label: "Challenges", icon: "challenges" },
  { href: "/experiments", label: "Projects", icon: "projects" },
  { href: "/search", label: "Resources", icon: "resources" },
] as const;

type TopNavIconName = (typeof TOP_NAV)[number]["icon"];

function TopNavIcon({ name }: { name: TopNavIconName }): ReactNode {
  const paths: Record<TopNavIconName, ReactNode> = {
    learn: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M4 5.5v16M8 7h8M8 10.5h7" />
      </>
    ),
    visualizer: (
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M7 15v-3M12 15V8M17 15v-5M8 22h8" />
      </>
    ),
    challenges: (
      <>
        <path d="M8 4h8v3a4 4 0 0 1-8 0Z" />
        <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 11v5M8 20h8M10 16h4v4h-4z" />
      </>
    ),
    projects: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="m9 14 2-2 2 2 4-4M8 7h8" />
      </>
    ),
    resources: (
      <>
        <path d="M5 3.5h10l4 4V21H5z" />
        <path d="M15 3.5V8h4M8 12h8M8 16h8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

function knowledgeCategory(challenge: ChallengeDefinition): Exclude<ChallengeCategory, "all"> {
  if (["challenge-heap-root", "challenge-bfs-queue"].includes(challenge.id)) {
    return "data-structures";
  }
  return "algorithms";
}

function codeCategoryLabel(challenge: CodeChallenge): string {
  if (challenge.category === "DATA_STRUCTURES") return "Data Structures";
  if (challenge.category === "SYSTEM_DESIGN") return "System Design";
  return "Algorithms";
}

function difficultyLabel(difficulty: DifficultyFilter | ChallengeDefinition["difficulty"]): string {
  if (difficulty === "BEGINNER") return "Easy";
  if (difficulty === "INTERMEDIATE") return "Medium";
  if (difficulty === "ADVANCED") return "Hard";
  return "All";
}

function difficultyClass(difficulty: DifficultyFilter | ChallengeDefinition["difficulty"]): string {
  if (difficulty === "ADVANCED") return styles.difficultyHard;
  if (difficulty === "INTERMEDIATE") return styles.difficultyMedium;
  return styles.difficultyEasy;
}

function filterCodeChallenges(
  source: readonly CodeChallenge[],
  category: ChallengeCategory,
  difficulty: DifficultyFilter,
  query: string
): CodeChallenge[] {
  const normalizedQuery = query.trim().toLowerCase();
  return source.filter((challenge) => {
    const categoryMatches =
      category === "all" ||
      (category === "algorithms" && challenge.category === "ALGORITHMS") ||
      (category === "data-structures" && challenge.category === "DATA_STRUCTURES") ||
      (category === "system-design" && challenge.category === "SYSTEM_DESIGN");
    const difficultyMatches = difficulty === "ALL" || challenge.difficulty === difficulty;
    const queryMatches =
      !normalizedQuery ||
      [
        challenge.title,
        challenge.summary,
        challenge.description,
        challenge.category,
        challenge.difficulty,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    return categoryMatches && difficultyMatches && queryMatches;
  });
}

function filterKnowledgeChallenges(
  source: readonly ChallengeDefinition[],
  category: ChallengeCategory,
  difficulty: DifficultyFilter,
  query: string
): ChallengeDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();
  return source.filter((challenge) => {
    const categoryMatches = category === "all" || knowledgeCategory(challenge) === category;
    const difficultyMatches = difficulty === "ALL" || challenge.difficulty === difficulty;
    const queryMatches =
      !normalizedQuery ||
      [
        challenge.title,
        challenge.description,
        challenge.prompt,
        challenge.algorithmSlug,
        CATEGORY_LABELS[knowledgeCategory(challenge)],
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    return categoryMatches && difficultyMatches && queryMatches;
  });
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function highlightCode(source: string): ReactNode[] {
  const tokenPattern =
    /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|new|class|throw|try|catch|finally|typeof|instanceof|break|continue|this)\b|\b(?:true|false|null|undefined|NaN)\b|\b\d+(?:\.\d+)?\b|\b(?:Map|Set|Math|Array|Object|String|Number|Boolean)\b|\b(?:number|string|boolean|void|unknown|any)\b|\b[A-Za-z_$][\w$]*(?=\s*\())/gm;
  const output: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of source.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) output.push(source.slice(cursor, start));

    let tokenClass = styles.codePlain;
    if (token.startsWith("//")) tokenClass = styles.codeComment;
    else if (/^["'`]/.test(token)) tokenClass = styles.codeString;
    else if (/^\d/.test(token)) tokenClass = styles.codeNumber;
    else if (/^(true|false|null|undefined|NaN)$/.test(token)) tokenClass = styles.codeLiteral;
    else if (
      /^(Map|Set|Math|Array|Object|String|Number|Boolean|number|string|boolean|void|unknown|any)$/.test(
        token
      )
    ) {
      tokenClass = styles.codeBuiltin;
    } else if (
      /^(const|let|var|function|return|if|else|for|while|new|class|throw|try|catch|finally|typeof|instanceof|break|continue|this)$/.test(
        token
      )
    ) {
      tokenClass = styles.codeKeyword;
    } else if (/[A-Za-z_$]/.test(token[0])) tokenClass = styles.codeFunction;

    output.push(
      <span className={tokenClass} key={`token-${index}`}>
        {token}
      </span>
    );
    cursor = start + token.length;
    index += 1;
  }

  if (cursor < source.length) output.push(source.slice(cursor));
  return output.length ? output : ["\u00a0"];
}

function BellIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function SearchIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function ProfileAvatar(): ReactNode {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="challenge-avatar-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9e7ec" />
          <stop offset="0.55" stopColor="#8fa8b4" />
          <stop offset="1" stopColor="#536f7f" />
        </linearGradient>
        <linearGradient id="challenge-avatar-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34556a" />
          <stop offset="1" stopColor="#182f42" />
        </linearGradient>
        <linearGradient id="challenge-avatar-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d6c1" />
          <stop offset="1" stopColor="#c99578" />
        </linearGradient>
        <clipPath id="challenge-avatar-clip">
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#challenge-avatar-clip)">
        <rect width="40" height="40" fill="url(#challenge-avatar-bg)" />
        <circle cx="32" cy="8" r="13" fill="#ecf5f7" opacity=".16" />
        <path
          d="M3 42c1.6-8.2 6.5-12.3 17-12.3S35.4 33.8 37 42Z"
          fill="url(#challenge-avatar-shirt)"
        />
        <path d="m14.1 29.4 5.9 5 5.9-5-2-4.1h-7.8Z" fill="#dfb99f" />
        <path
          d="M11.1 16.1c0-7.2 3.5-10.8 8.9-10.8s8.9 3.6 8.9 10.8c0 7.2-3.4 11.4-8.9 11.4s-8.9-4.2-8.9-11.4Z"
          fill="url(#challenge-avatar-skin)"
        />
        <path
          d="M10.8 15.7c-.8-7.9 3.1-12.4 9.4-12.4 5.8 0 9.2 3.5 9.1 10.7-1.7-.3-3.4-1.6-4.5-3.6-2.5 2.6-7.1 4.2-13.5 4.1Z"
          fill="#2a3038"
        />
        <path
          d="M11.2 16.1c-.6-3.4-.2-6.2 1.1-8.2-2.2 1.4-3.1 4.2-2.6 7.8l.6 4.1Z"
          fill="#2a3038"
        />
        <path d="M28.9 15.7c.6-2.7.2-5.5-1.1-7.5 2.1 1.3 3.1 4 2.6 7.5l-.6 4.2Z" fill="#2a3038" />
        <path
          d="M15.3 17.1c.7-.5 1.5-.5 2.2 0M22.6 17.1c.7-.5 1.5-.5 2.2 0"
          stroke="#593e35"
          strokeWidth=".8"
          strokeLinecap="round"
        />
        <path
          d="M18.1 22.5c1.2.8 2.6.8 3.8 0"
          stroke="#985d52"
          strokeWidth=".9"
          strokeLinecap="round"
        />
        <path d="M15 30.1 20 35l5-4.9 2.6 1.3L31 40H9l3.4-8.6Z" fill="#e7eef0" opacity=".94" />
      </g>
    </svg>
  );
}

export function ChallengeWorkspace({ challenges, initialChallengeId }: Props): ReactNode {
  const initialCode = CODE_CHALLENGES.find((item) => item.id === initialChallengeId);
  const initialKnowledge = challenges.find(
    (item) => item.id === initialChallengeId || item.slug === initialChallengeId
  );
  const initialCodeChallenge = initialCode ?? CODE_CHALLENGES[0];

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    initialKnowledge && !initialCode ? "knowledge" : "code"
  );
  const [selectedCodeId, setSelectedCodeId] = useState(initialCodeChallenge?.id ?? "");
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState(
    initialKnowledge?.id ?? challenges[0]?.id ?? ""
  );
  const [category, setCategory] = useState<ChallengeCategory>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [query, setQuery] = useState("");
  const [problemTab, setProblemTab] = useState<ProblemTab>("problem");
  const [code, setCode] = useState(initialCodeChallenge?.starterCode ?? "");
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [runError, setRunError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [knowledgeResult, setKnowledgeResult] = useState<ChallengeEvaluation | null>(null);
  const [isSubmittingKnowledge, setIsSubmittingKnowledge] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editorSettingsOpen, setEditorSettingsOpen] = useState(false);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(12);
  const [copyStatus, setCopyStatus] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);

  const visibleCodeChallenges = useMemo(
    () => filterCodeChallenges(CODE_CHALLENGES, category, difficulty, query),
    [category, difficulty, query]
  );
  const visibleKnowledgeChallenges = useMemo(
    () => filterKnowledgeChallenges(challenges, category, difficulty, query),
    [challenges, category, difficulty, query]
  );

  const selectedCodeChallenge = useMemo(
    () =>
      visibleCodeChallenges.find((item) => item.id === selectedCodeId) ?? visibleCodeChallenges[0],
    [selectedCodeId, visibleCodeChallenges]
  );
  const selectedKnowledgeChallenge = useMemo(
    () =>
      visibleKnowledgeChallenges.find((item) => item.id === selectedKnowledgeId) ??
      visibleKnowledgeChallenges[0],
    [selectedKnowledgeId, visibleKnowledgeChallenges]
  );

  const activeCodeChallenge = workspaceMode === "code" ? selectedCodeChallenge : undefined;
  const activeKnowledgeChallenge =
    workspaceMode === "knowledge" ? selectedKnowledgeChallenge : undefined;
  const activeHints = activeCodeChallenge?.hints ?? activeKnowledgeChallenge?.hints ?? [];
  const maxHints = activeCodeChallenge?.hints.length ?? activeKnowledgeChallenge?.maxHints ?? 0;
  const totalVisible = visibleCodeChallenges.length + visibleKnowledgeChallenges.length;
  const canUseHint = hintsUsed < Math.min(maxHints, activeHints.length);
  const currentRunPassed = Boolean(
    runResult && runResult.total > 0 && runResult.passed === runResult.total
  );
  const highlightedCode = useMemo(() => highlightCode(code), [code]);

  const categoryOptions: { id: ChallengeCategory; label: string }[] = [
    { id: "all", label: "All Challenges" },
    { id: "algorithms", label: "Algorithms" },
    { id: "data-structures", label: "Data Structures" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "system-design", label: "System Design" },
  ];

  function resetCodeState(nextChallenge?: CodeChallenge): void {
    setCode(nextChallenge?.starterCode ?? "");
    setRunResult(null);
    setRunError("");
    setSubmitted(false);
    setHintsUsed(0);
    setProblemTab("problem");
    setCopyStatus("");
  }

  function selectCodeChallenge(nextChallenge: CodeChallenge): void {
    setWorkspaceMode("code");
    setSelectedCodeId(nextChallenge.id);
    setKnowledgeResult(null);
    setAnswer("");
    resetCodeState(nextChallenge);
  }

  function selectKnowledgeChallenge(nextChallenge: ChallengeDefinition): void {
    setWorkspaceMode("knowledge");
    setSelectedKnowledgeId(nextChallenge.id);
    setAnswer("");
    setKnowledgeResult(null);
    setHintsUsed(0);
    setProblemTab("problem");
    setRunResult(null);
    setRunError("");
  }

  function reconcileSelection(
    nextCategory: ChallengeCategory,
    nextDifficulty: DifficultyFilter,
    nextQuery: string
  ): void {
    const nextCode = filterCodeChallenges(CODE_CHALLENGES, nextCategory, nextDifficulty, nextQuery);
    const nextKnowledge = filterKnowledgeChallenges(
      challenges,
      nextCategory,
      nextDifficulty,
      nextQuery
    );

    if (workspaceMode === "code" && nextCode.some((item) => item.id === selectedCodeId)) {
      return;
    }
    if (
      workspaceMode === "knowledge" &&
      nextKnowledge.some((item) => item.id === selectedKnowledgeId)
    ) {
      return;
    }

    if (nextCode[0]) selectCodeChallenge(nextCode[0]);
    else if (nextKnowledge[0]) selectKnowledgeChallenge(nextKnowledge[0]);
    else {
      setRunResult(null);
      setKnowledgeResult(null);
    }
  }

  function changeCategory(nextCategory: ChallengeCategory): void {
    setCategory(nextCategory);
    reconcileSelection(nextCategory, difficulty, query);
  }

  function changeDifficulty(nextDifficulty: DifficultyFilter): void {
    setDifficulty(nextDifficulty);
    reconcileSelection(category, nextDifficulty, query);
  }

  function changeSearch(nextQuery: string): void {
    setQuery(nextQuery);
    reconcileSelection(category, difficulty, nextQuery);
  }

  async function runTests(submitAfterPass = false): Promise<void> {
    if (!activeCodeChallenge || isRunning) return;
    setIsRunning(true);
    setRunError("");
    setRunResult(null);
    setSubmitted(false);
    try {
      const result = await runCodeChallenge(activeCodeChallenge, code);
      setRunResult(result);
      if (submitAfterPass && result.passed === result.total) setSubmitted(true);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Unable to run the solution.");
    } finally {
      setIsRunning(false);
    }
  }

  async function submitKnowledgeAnswer(): Promise<void> {
    if (!activeKnowledgeChallenge || !answer.trim() || isSubmittingKnowledge) return;
    setIsSubmittingKnowledge(true);
    setKnowledgeResult(null);
    try {
      const response = await fetch(`/api/challenges/${activeKnowledgeChallenge.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ answer, hintsUsed }),
      });
      const payload = (await response.json()) as {
        evaluation?: ChallengeEvaluation;
        error?: { message?: string };
      };
      if (!response.ok || !payload.evaluation) {
        throw new Error(payload.error?.message ?? "Unable to submit this challenge.");
      }
      setKnowledgeResult(payload.evaluation);
    } catch (error) {
      setKnowledgeResult({
        challengeId: activeKnowledgeChallenge.id,
        correct: false,
        score: 0,
        maxScore: activeKnowledgeChallenge.score,
        feedback: error instanceof Error ? error.message : "Unable to submit this challenge.",
        explanation: "",
        correctAnswer: "",
        hintsUsed,
        completed: false,
      });
    } finally {
      setIsSubmittingKnowledge(false);
    }
  }

  function changeCode(value: string): void {
    setCode(value);
    setRunResult(null);
    setRunError("");
    setSubmitted(false);
  }

  async function copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  function syncEditorScroll(): void {
    if (!textareaRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }

  useEffect(() => {
    const requestedCode = CODE_CHALLENGES.find((item) => item.id === initialChallengeId);
    const requestedKnowledge = challenges.find(
      (item) => item.id === initialChallengeId || item.slug === initialChallengeId
    );
    if (requestedKnowledge && !requestedCode) return;

    const challenge = requestedCode ?? CODE_CHALLENGES[0];
    if (!challenge) return;

    let cancelled = false;
    setIsRunning(true);
    runCodeChallenge(challenge, challenge.starterCode)
      .then((result) => {
        if (!cancelled) setRunResult(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRunError(error instanceof Error ? error.message : "Unable to run starter tests.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsRunning(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialChallengeId, challenges]);

  useEffect(() => {
    if (!editorFullscreen) return;
    const oldOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditorFullscreen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [editorFullscreen]);

  const resultHeading = submitted
    ? "All Tests Passed"
    : runResult
      ? currentRunPassed
        ? "All Tests Passed"
        : "Some Tests Failed"
      : runError
        ? "Run Failed"
        : isRunning
          ? "Running Tests"
          : "Test Results";

  return (
    <div className={styles.challengeApp}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.topbar}>
        <div className={styles.topbarBrandCell}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="challenge-sidebar"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
          <Link href="/" className={styles.brand} aria-label="LogicLab home">
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 40 40" focusable="false">
                <path d="m15.5 11-9 9 9 9M24.5 11l9 9-9 9M23 7.5 17 32.5" />
              </svg>
            </span>
            <span className={styles.brandCopy}>
              <span className={styles.brandName}>
                Logic<span>Lab</span>
              </span>
            </span>
          </Link>
        </div>

        <nav className={styles.topNavigation} aria-label="Main navigation">
          {TOP_NAV.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`${styles.topNavLink} ${item.href === "/challenges" ? styles.topNavLinkActive : ""}`}
              aria-current={item.href === "/challenges" ? "page" : undefined}
            >
              <span className={styles.topNavIcon}>
                <TopNavIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.topbarActions}>
          <label className={styles.globalSearch}>
            <span className={styles.searchGlyph}>
              <SearchIcon />
            </span>
            <input
              id="global-search-input"
              type="search"
              value={query}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search challenges..."
              autoComplete="off"
              aria-label="Search challenges"
            />
          </label>
          <Link
            href="/activity"
            className={styles.iconAction}
            aria-label="Notifications and recent activity"
            title="Notifications"
          >
            <BellIcon />
            <i />
          </Link>
          <Link href="/settings" className={styles.profileButton} aria-label="Account settings">
            <ProfileAvatar />
          </Link>
        </div>
      </header>

      <div className={styles.appBody}>
        <aside
          id="challenge-sidebar"
          className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}
          aria-label="Main navigation"
        >
          <nav className={styles.sidebarNav}>
            <Link href="/" className={styles.sideLink} onClick={() => setMobileNavOpen(false)}>
              <HomeIcon />
              <span>Home</span>
            </Link>

            <div className={styles.sideGroup}>
              <h2>Learning</h2>
              <Link
                href="/algorithms"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <AlgorithmsIcon />
                <span>Algorithms</span>
              </Link>
              <Link
                href="/data-structures"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <DataStructuresIcon />
                <span>Data Structures</span>
              </Link>
              <span className={styles.sideLink} aria-disabled="true">
                <span className={styles.sideGlyph}>◇</span>
                <span>System Design</span>
              </span>
              <span className={styles.sideLink} aria-disabled="true">
                <span className={styles.sideGlyph}>⬡</span>
                <span>Cybersecurity</span>
              </span>
            </div>

            <div className={styles.sideGroup}>
              <h2>Labs</h2>
              <Link
                href="/visualizer"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <VisualizerIcon />
                <span>Interactive Lab</span>
              </Link>
              <Link
                href="/visualizer"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className={styles.sideGlyph}>◫</span>
                <span>Visualizer</span>
              </Link>
              <Link
                href="/challenges"
                className={`${styles.sideLink} ${styles.sideLinkActive}`}
                aria-current="page"
                onClick={() => setMobileNavOpen(false)}
              >
                <ChallengesIcon />
                <span>Challenges</span>
              </Link>
              <Link
                href="/experiments"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className={styles.sideGlyph}>▱</span>
                <span>Projects</span>
              </Link>
            </div>

            <div className={styles.sideGroup}>
              <h2>More</h2>
              <Link
                href="/search"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className={styles.sideGlyph}>▤</span>
                <span>Resources</span>
              </Link>
              <span className={styles.sideLink} aria-disabled="true">
                <span className={styles.sideGlyph}>▧</span>
                <span>Notes</span>
              </span>
              <Link
                href="/bookmarks"
                className={styles.sideLink}
                onClick={() => setMobileNavOpen(false)}
              >
                <BookmarksIcon />
                <span>Bookmarks</span>
              </Link>
            </div>
          </nav>
        </aside>

        {mobileNavOpen && (
          <button
            type="button"
            className={styles.sidebarBackdrop}
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <main className={styles.content} id="main-content" tabIndex={-1}>
          <section className={styles.pageIntro} aria-labelledby="challenges-page-title">
            <div className={styles.heroCopy}>
              <h1 id="challenges-page-title">Challenges</h1>
              <p>Practice, solve and test your understanding with hands-on problems.</p>
            </div>
            <svg
              className={styles.heroMountain}
              viewBox="0 0 620 190"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id="challenge-mountain-far" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#17616e" />
                  <stop offset=".56" stopColor="#103246" />
                  <stop offset="1" stopColor="#0a1c2b" />
                </linearGradient>
                <linearGradient id="challenge-mountain-main" x1="0" y1="0" x2=".9" y2="1">
                  <stop offset="0" stopColor="#16a6a7" />
                  <stop offset=".42" stopColor="#0c6876" />
                  <stop offset="1" stopColor="#102b40" />
                </linearGradient>
                <linearGradient id="challenge-mountain-shadow" x1="0" y1="0" x2="1" y2=".8">
                  <stop offset="0" stopColor="#0e475d" />
                  <stop offset="1" stopColor="#081a2a" />
                </linearGradient>
                <linearGradient id="challenge-mountain-snow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#b1fff0" />
                  <stop offset=".5" stopColor="#57d9d2" />
                  <stop offset="1" stopColor="#197b8a" />
                </linearGradient>
                <radialGradient id="challenge-mountain-glow">
                  <stop offset="0" stopColor="#00dec9" stopOpacity=".27" />
                  <stop offset="1" stopColor="#00dec9" stopOpacity="0" />
                </radialGradient>
                <filter id="challenge-mountain-blur" x="-30%" y="-80%" width="160%" height="260%">
                  <feGaussianBlur stdDeviation="12" />
                </filter>
              </defs>
              <ellipse
                cx="380"
                cy="146"
                rx="220"
                ry="54"
                fill="url(#challenge-mountain-glow)"
                filter="url(#challenge-mountain-blur)"
              />
              <path
                d="M0 174 71 124l43 18 74-58 52 34 69-54 57 45 64-37 74 54 43-22 73 70Z"
                fill="url(#challenge-mountain-far)"
                opacity=".76"
              />
              <path
                d="m58 180 89-67 42 22 74-58 52 29 77-83 53 61 62-38 94 74 51-28 68 88Z"
                fill="url(#challenge-mountain-main)"
                opacity=".9"
              />
              <path
                d="m260 180 74-85 37 15 76-91 54 66 45-23 73 118Z"
                fill="url(#challenge-mountain-shadow)"
                opacity=".84"
              />
              <path
                d="m337 109 54-59 25 25-28-7-20 18-14-4Z"
                fill="url(#challenge-mountain-snow)"
                opacity=".82"
              />
              <path
                d="m385 79 62-60 39 45-22-12-19 18-16-5-17 20Z"
                fill="url(#challenge-mountain-snow)"
              />
              <path d="m392 79 55-60 19 27-18-8-13 18-13-3-16 21Z" fill="#d3fff8" opacity=".42" />
              <path d="m148 113 43-19 24 17-24-5-21 17-13-10Z" fill="#65d9d2" opacity=".42" />
              <path d="m527 105 33-21 26 19-19-6-18 15-10-7Z" fill="#58c5ca" opacity=".36" />
              <path d="M447 20v-14" stroke="#6cf1dc" strokeWidth="2" />
              <path d="M447 7h24l-7 11h-17Z" fill="#5cebd5" />
              <path
                d="m0 175 83-35 43 21 86-48 54 35 71-39 66 33 72-33 67 36 78-31"
                fill="none"
                stroke="#1aa8a9"
                strokeWidth="1.2"
                opacity=".42"
              />
              <path
                d="m198 100 42-25 34 20M473 84l34-19 24 15"
                fill="none"
                stroke="#62e8db"
                strokeWidth="1.2"
                opacity=".25"
              />
              <path d="M80 183h464" stroke="#0b6671" strokeWidth="1" opacity=".56" />
            </svg>
          </section>

          <section className={styles.filterBar} aria-label="Challenge categories and difficulty">
            <div
              className={styles.categoryTabs}
              role="group"
              aria-label="Filter challenges by category"
            >
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.categoryTab} ${category === option.id ? styles.categoryTabActive : ""}`}
                  aria-pressed={category === option.id}
                  onClick={() => changeCategory(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className={styles.difficultyFilter}>
              <span>Difficulty:</span>
              <select
                value={difficulty}
                onChange={(event) => changeDifficulty(event.target.value as DifficultyFilter)}
                aria-label="Filter challenges by difficulty"
              >
                <option value="ALL">All</option>
                <option value="BEGINNER">Easy</option>
                <option value="INTERMEDIATE">Medium</option>
                <option value="ADVANCED">Hard</option>
              </select>
            </label>
          </section>

          <div className={styles.workspaceGrid}>
            <aside className={styles.challengeListPanel} aria-label="Challenge list">
              <div className={styles.panelHeader}>
                <div>
                  <h2>Challenge List</h2>
                  <p>
                    {totalVisible} {totalVisible === 1 ? "challenge" : "challenges"}
                  </p>
                </div>
              </div>

              <div className={styles.challengeList}>
                {visibleCodeChallenges.map((item) => {
                  const active = workspaceMode === "code" && item.id === activeCodeChallenge?.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`${styles.challengeItem} ${active ? styles.challengeItemActive : ""}`}
                      onClick={() => selectCodeChallenge(item)}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className={styles.challengeItemContent}>
                        <span className={styles.challengeItemTitle}>{item.title}</span>
                        <span className={styles.challengeItemMeta}>
                          <span>{codeCategoryLabel(item)}</span>
                          <span className={difficultyClass(item.difficulty)}>
                            {difficultyLabel(item.difficulty)}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}

                {visibleKnowledgeChallenges.map((item) => {
                  const active =
                    workspaceMode === "knowledge" && item.id === activeKnowledgeChallenge?.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`${styles.challengeItem} ${active ? styles.challengeItemActive : ""}`}
                      onClick={() => selectKnowledgeChallenge(item)}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className={styles.challengeItemContent}>
                        <span className={styles.challengeItemTitle}>{item.title}</span>
                        <span className={styles.challengeItemMeta}>
                          <span>{CATEGORY_LABELS[knowledgeCategory(item)]}</span>
                          <span className={difficultyClass(item.difficulty)}>
                            {difficultyLabel(item.difficulty)}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {!activeCodeChallenge && !activeKnowledgeChallenge ? (
              <section className={styles.emptyState} aria-live="polite">
                <h2>No challenges found</h2>
                <p>There are no published challenges for this selection yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("all");
                    setDifficulty("ALL");
                    setQuery("");
                    reconcileSelection("all", "ALL", "");
                  }}
                >
                  Clear filters
                </button>
              </section>
            ) : (
              <>
                <section className={styles.problemPanel} aria-labelledby="challenge-title">
                  <header className={styles.problemHeader}>
                    <h2 id="challenge-title">
                      {activeCodeChallenge?.title ?? activeKnowledgeChallenge?.title}
                    </h2>
                    <span
                      className={`${styles.difficultyBadge} ${difficultyClass(activeCodeChallenge?.difficulty ?? activeKnowledgeChallenge!.difficulty)}`}
                    >
                      {difficultyLabel(
                        activeCodeChallenge?.difficulty ?? activeKnowledgeChallenge!.difficulty
                      )}
                    </span>
                  </header>

                  <div
                    className={styles.problemTabs}
                    role="tablist"
                    aria-label="Challenge information"
                  >
                    {(["problem", "examples", "constraints"] as const).map((tab) => (
                      <button
                        key={tab}
                        id={`challenge-tab-${tab}`}
                        type="button"
                        role="tab"
                        aria-selected={problemTab === tab}
                        aria-controls="challenge-tab-panel"
                        className={`${styles.problemTab} ${problemTab === tab ? styles.problemTabActive : ""}`}
                        onClick={() => setProblemTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div
                    id="challenge-tab-panel"
                    className={styles.problemBody}
                    role="tabpanel"
                    aria-labelledby={`challenge-tab-${problemTab}`}
                  >
                    {problemTab === "problem" && (
                      <div className={styles.problemContent}>
                        <p className={styles.problemDescription}>
                          {activeCodeChallenge?.description ??
                            activeKnowledgeChallenge?.description}
                          {activeCodeChallenge?.id === "two-sum" && (
                            <>
                              {" "}
                              You may assume that each input would have exactly one solution, and
                              you may not use the same element twice.
                            </>
                          )}
                        </p>
                        {activeKnowledgeChallenge?.prompt && (
                          <p className={styles.problemPrompt}>{activeKnowledgeChallenge.prompt}</p>
                        )}
                        {(activeCodeChallenge?.examples ?? activeKnowledgeChallenge?.examples ?? [])
                          .slice(0, 1)
                          .map((example, index) => (
                            <article
                              className={styles.exampleCard}
                              key={`${example.title}-${index}`}
                            >
                              <h3>{example.title || `Example ${index + 1}`}</h3>
                              <dl>
                                <div>
                                  <dt>Input</dt>
                                  <dd>{example.input}</dd>
                                </div>
                                <div>
                                  <dt>Output</dt>
                                  <dd>{example.output}</dd>
                                </div>
                              </dl>
                              {example.explanation && <p>{example.explanation}</p>}
                            </article>
                          ))}
                      </div>
                    )}
                    {problemTab === "examples" && (
                      <div className={styles.detailTabContent}>
                        {(
                          activeCodeChallenge?.examples ??
                          activeKnowledgeChallenge?.examples ??
                          []
                        ).map((example, index) => (
                          <article className={styles.exampleCard} key={`${example.title}-${index}`}>
                            <h3>{example.title || `Example ${index + 1}`}</h3>
                            <dl>
                              <div>
                                <dt>Input</dt>
                                <dd>{example.input}</dd>
                              </div>
                              <div>
                                <dt>Output</dt>
                                <dd>{example.output}</dd>
                              </div>
                            </dl>
                            {example.explanation && <p>{example.explanation}</p>}
                          </article>
                        ))}
                      </div>
                    )}
                    {problemTab === "constraints" && (
                      <ul className={styles.constraintList}>
                        {(
                          activeCodeChallenge?.constraints ??
                          activeKnowledgeChallenge?.constraints ??
                          []
                        ).map((constraint) => (
                          <li key={constraint}>{constraint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                <section className={styles.solutionColumn} aria-label="Solution workspace">
                  {activeCodeChallenge ? (
                    <>
                      <section
                        className={`${styles.solutionPanel} ${editorFullscreen ? styles.solutionPanelFullscreen : ""}`}
                        aria-labelledby="solution-title"
                      >
                        <div className={styles.solutionHeading}>
                          <div className={styles.solutionTitleGroup}>
                            <h2 id="solution-title">Your Solution</h2>
                            {copyStatus && (
                              <span className={styles.copyStatus} role="status">
                                {copyStatus}
                              </span>
                            )}
                          </div>
                          <div className={styles.editorToolbar}>
                            <label className={styles.languageSelect}>
                              <span className={styles.visuallyHidden}>Editor language</span>
                              <select value="typescript" disabled>
                                <option value="typescript">TypeScript</option>
                              </select>
                            </label>
                            <button
                              type="button"
                              className={styles.editorIconButton}
                              onClick={() => void copyCode()}
                              aria-label="Copy solution code"
                              title="Copy code"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="8" y="8" width="12" height="12" rx="2" />
                                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                              </svg>
                            </button>
                            <div className={styles.editorSettingsWrap}>
                              <button
                                type="button"
                                className={styles.editorIconButton}
                                onClick={() => setEditorSettingsOpen((open) => !open)}
                                aria-label="Editor settings"
                                aria-expanded={editorSettingsOpen}
                                title="Editor settings"
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.8v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.8v-2.8h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L7 8.2l2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.8v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.8h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                                </svg>
                              </button>
                              {editorSettingsOpen && (
                                <div
                                  className={styles.editorSettingsMenu}
                                  role="group"
                                  aria-label="Editor settings"
                                >
                                  <span>Font size</span>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditorFontSize((value) => Math.max(10, value - 1))
                                      }
                                      aria-label="Decrease font size"
                                    >
                                      A−
                                    </button>
                                    <strong>{editorFontSize}px</strong>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditorFontSize((value) => Math.min(16, value + 1))
                                      }
                                      aria-label="Increase font size"
                                    >
                                      A+
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className={styles.editorIconButton}
                              onClick={() => setEditorFullscreen((value) => !value)}
                              aria-label={
                                editorFullscreen ? "Exit editor fullscreen" : "Expand editor"
                              }
                              title={editorFullscreen ? "Exit fullscreen" : "Fullscreen editor"}
                            >
                              {editorFullscreen ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className={styles.editorShell}>
                          <div className={styles.editorGutter} aria-hidden="true">
                            {code.split("\n").map((_, index) => (
                              <span key={index}>{index + 1}</span>
                            ))}
                          </div>
                          <div className={styles.editorViewport}>
                            <pre
                              ref={highlightRef}
                              className={styles.editorHighlight}
                              aria-hidden="true"
                              style={{ fontSize: `${editorFontSize}px` }}
                            >
                              <code>{highlightedCode}</code>
                            </pre>
                            <textarea
                              ref={textareaRef}
                              className={styles.codeEditor}
                              value={code}
                              onChange={(event) => changeCode(event.target.value)}
                              onScroll={syncEditorScroll}
                              onKeyDown={(event) => {
                                if (event.key === "Tab") {
                                  event.preventDefault();
                                  const target = event.currentTarget;
                                  const start = target.selectionStart;
                                  const end = target.selectionEnd;
                                  const nextCode = `${code.slice(0, start)}  ${code.slice(end)}`;
                                  changeCode(nextCode);
                                  requestAnimationFrame(() => {
                                    target.selectionStart = target.selectionEnd = start + 2;
                                  });
                                }
                              }}
                              spellCheck={false}
                              autoCapitalize="off"
                              autoCorrect="off"
                              aria-label={`${activeCodeChallenge.functionName} TypeScript editor`}
                              wrap="off"
                              style={{ fontSize: `${editorFontSize}px` }}
                            />
                          </div>
                        </div>

                        <div className={styles.editorActions}>
                          <button
                            type="button"
                            className={styles.resetButton}
                            onClick={() => resetCodeState(activeCodeChallenge)}
                            disabled={isRunning}
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            className={styles.runButton}
                            onClick={() => void runTests(false)}
                            disabled={isRunning || !code.trim()}
                          >
                            {isRunning ? "Running…" : "Run Tests"}
                          </button>
                          <button
                            type="button"
                            className={styles.submitButton}
                            onClick={() => void runTests(true)}
                            disabled={isRunning || !code.trim()}
                          >
                            {isRunning ? "Checking…" : "Submit Solution"}
                          </button>
                        </div>
                      </section>

                      <section
                        className={`${styles.testResultsPanel} ${currentRunPassed ? styles.testsPassed : ""}`}
                        aria-live="polite"
                      >
                        <div className={styles.testResultsHeading}>
                          <div className={styles.resultTitleBlock}>
                            <span
                              className={`${styles.resultStatusIcon} ${currentRunPassed ? styles.resultStatusSuccess : ""}`}
                              aria-hidden="true"
                            >
                              {currentRunPassed ? "✓" : runError ? "!" : "·"}
                            </span>
                            <div>
                              <h2>{resultHeading}</h2>
                              <p>
                                {runError ||
                                  (runResult
                                    ? `${runResult.passed} / ${runResult.total} test cases passed`
                                    : isRunning
                                      ? "Checking your solution against the test cases…"
                                      : "Run your solution to check the test cases.")}
                              </p>
                            </div>
                          </div>
                          <div className={styles.runMetrics}>
                            <span>
                              Runtime:{" "}
                              <strong>{runResult ? `${runResult.durationMs} ms` : "—"}</strong>
                            </span>
                            <span title="Memory usage is not exposed by the browser worker">
                              Memory: <strong>—</strong>
                            </span>
                          </div>
                        </div>
                        {runResult && (
                          <details open className={styles.testCaseDetails}>
                            <summary>View test cases</summary>
                            <div className={styles.testCaseList}>
                              {runResult.tests.map((test, index) => (
                                <div key={test.id} className={styles.testCaseRow}>
                                  <span>Test Case {index + 1}</span>
                                  <strong
                                    className={test.passed ? styles.testPassed : styles.testFailed}
                                  >
                                    {test.passed ? "Passed" : "Failed"}
                                  </strong>
                                  <small>{test.durationMs} ms</small>
                                  {!test.passed && (
                                    <p>
                                      Expected {formatValue(test.expected)} · Received{" "}
                                      {test.error || formatValue(test.actual)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </section>

                      <div className={styles.supportGrid}>
                        <section className={styles.supportPanel}>
                          <div className={styles.supportHeading}>
                            <div className={styles.supportTitleWithIcon}>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M9 18h6M10 21h4M8.4 14.4A7 7 0 1 1 15.7 14c-.8.6-1.2 1.3-1.4 2H9.7c-.2-.7-.6-1.2-1.3-1.6Z" />
                                <path d="M12 3v2M4.8 6l1.4 1.4M19.2 6l-1.4 1.4" />
                              </svg>
                              <h2>Need a hint?</h2>
                            </div>
                            <button
                              type="button"
                              className={styles.hintButton}
                              onClick={() => setHintsUsed((value) => Math.min(value + 1, maxHints))}
                              disabled={!canUseHint}
                            >
                              {canUseHint ? "Show Hint" : "All Hints Used"}
                            </button>
                          </div>
                          {hintsUsed > 0 && (
                            <div className={styles.hintContent}>
                              <span>Hint {hintsUsed}</span>
                              <p>{activeHints[hintsUsed - 1]}</p>
                            </div>
                          )}
                        </section>

                        <section className={styles.supportPanel}>
                          <div className={styles.supportHeading}>
                            <div className={styles.supportTitleWithIcon}>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
                                <path d="M4 5.5v16M8 7h8M8 10.5h7" />
                              </svg>
                              <h2>Related Learning</h2>
                            </div>
                          </div>
                          {activeCodeChallenge.relatedLearning[0] && (
                            <Link
                              className={styles.relatedCard}
                              href={activeCodeChallenge.relatedLearning[0].href}
                              aria-label={`Explore related learning: ${activeCodeChallenge.relatedLearning.map((item) => item.title).join(", ")}`}
                            >
                              <span className={styles.relatedCardIcon} aria-hidden="true">
                                <svg viewBox="0 0 24 24">
                                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
                                  <path d="M4 5.5v16M8 7h8M8 10.5h7" />
                                </svg>
                              </span>
                              <span className={styles.relatedCardText}>
                                <strong>
                                  {activeCodeChallenge.relatedLearning
                                    .slice(0, 2)
                                    .map((item) => item.title)
                                    .join(", ")}
                                </strong>
                                <small>Explore related concepts and explanations</small>
                              </span>
                              <svg
                                className={styles.relatedCardArrow}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </Link>
                          )}
                        </section>
                      </div>
                    </>
                  ) : activeKnowledgeChallenge ? (
                    <>
                      <section className={styles.solutionPanel}>
                        <div className={styles.solutionHeading}>
                          <div className={styles.solutionTitleGroup}>
                            <h2>Your Answer</h2>
                          </div>
                          <span className={styles.answerType}>
                            {activeKnowledgeChallenge.options ? "Multiple choice" : "Short answer"}
                          </span>
                        </div>
                        {activeKnowledgeChallenge.options ? (
                          <fieldset className={styles.answerOptions}>
                            <legend>Choose your answer</legend>
                            {activeKnowledgeChallenge.options.map((option, index) => (
                              <label
                                key={option.id}
                                className={`${styles.answerOption} ${answer === option.label ? styles.answerOptionSelected : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`answer-${activeKnowledgeChallenge.id}`}
                                  value={option.label}
                                  checked={answer === option.label}
                                  onChange={() => {
                                    setAnswer(option.label);
                                    setKnowledgeResult(null);
                                  }}
                                />
                                <span className={styles.optionLetter}>
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span>{option.label}</span>
                              </label>
                            ))}
                          </fieldset>
                        ) : (
                          <label className={styles.shortAnswerField}>
                            <span>Your response</span>
                            <textarea
                              value={answer}
                              onChange={(event) => {
                                setAnswer(event.target.value);
                                setKnowledgeResult(null);
                              }}
                              maxLength={2000}
                              rows={7}
                              placeholder="Write your answer here…"
                            />
                          </label>
                        )}
                        <div className={styles.editorActions}>
                          <button
                            type="button"
                            className={styles.resetButton}
                            onClick={() => {
                              setAnswer("");
                              setKnowledgeResult(null);
                            }}
                            disabled={!answer && !knowledgeResult}
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            className={styles.submitButton}
                            onClick={() => void submitKnowledgeAnswer()}
                            disabled={!answer.trim() || isSubmittingKnowledge}
                          >
                            {isSubmittingKnowledge ? "Checking…" : "Submit Answer"}
                          </button>
                        </div>
                      </section>

                      <section
                        className={`${styles.testResultsPanel} ${knowledgeResult?.correct ? styles.testsPassed : ""}`}
                        aria-live="polite"
                      >
                        <div className={styles.testResultsHeading}>
                          <div>
                            <h2>
                              {knowledgeResult
                                ? knowledgeResult.correct
                                  ? "Correct Answer"
                                  : "Try Again"
                                : "Submission Result"}
                            </h2>
                            <p>
                              {knowledgeResult?.feedback ??
                                "Your feedback will appear after you submit your answer."}
                            </p>
                          </div>
                          {knowledgeResult && (
                            <div className={styles.runMetrics}>
                              <span>
                                Score:{" "}
                                <strong>
                                  {knowledgeResult.score}/{knowledgeResult.maxScore}
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>
                        {knowledgeResult?.explanation && (
                          <p className={styles.resultExplanation}>{knowledgeResult.explanation}</p>
                        )}
                      </section>

                      <div className={styles.supportGrid}>
                        <section className={styles.supportPanel}>
                          <div className={styles.supportHeading}>
                            <div className={styles.supportTitleWithIcon}>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M9 18h6M10 21h4M8.4 14.4A7 7 0 1 1 15.7 14c-.8.6-1.2 1.3-1.4 2H9.7c-.2-.7-.6-1.2-1.3-1.6Z" />
                                <path d="M12 3v2M4.8 6l1.4 1.4M19.2 6l-1.4 1.4" />
                              </svg>
                              <h2>Need a hint?</h2>
                            </div>
                            <button
                              type="button"
                              className={styles.hintButton}
                              onClick={() =>
                                setHintsUsed((value) =>
                                  Math.min(
                                    value + 1,
                                    activeKnowledgeChallenge.maxHints,
                                    activeKnowledgeChallenge.hints.length
                                  )
                                )
                              }
                              disabled={!canUseHint || isSubmittingKnowledge}
                            >
                              {canUseHint ? "Show Hint" : "All Hints Used"}
                            </button>
                          </div>
                          {hintsUsed > 0 && (
                            <div className={styles.hintContent}>
                              <span>Hint {hintsUsed}</span>
                              <p>{activeKnowledgeChallenge.hints[hintsUsed - 1]}</p>
                            </div>
                          )}
                        </section>
                        <section className={styles.supportPanel}>
                          <div className={styles.supportHeading}>
                            <div className={styles.supportTitleWithIcon}>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
                                <path d="M4 5.5v16M8 7h8M8 10.5h7" />
                              </svg>
                              <h2>Related Learning</h2>
                            </div>
                          </div>
                          <Link
                            className={styles.relatedCard}
                            href={`/visualizer/${activeKnowledgeChallenge.algorithmSlug}`}
                          >
                            <span className={styles.relatedCardIcon} aria-hidden="true">
                              ↗
                            </span>
                            <span className={styles.relatedCardText}>
                              <strong>Open Visualizer</strong>
                              <small>Explore the step-by-step simulation</small>
                            </span>
                            <svg
                              className={styles.relatedCardArrow}
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </Link>
                        </section>
                      </div>
                    </>
                  ) : null}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
