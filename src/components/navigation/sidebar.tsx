"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AlgorithmsIcon,
  BookmarksIcon,
  ChallengesIcon,
  CompareIcon,
  HistoryIcon,
  HomeIcon,
  ProgressIcon,
  SettingsIcon,
  VisualizerIcon,
} from "@/components/navigation/icons";
import { navigationGroups, type NavigationGroup } from "@/components/navigation/navigation-data";

type ActivityDay = {
  ActivityDate?: string | Date;
  activityDate?: string | Date;
  ActivityCount?: number;
  activityCount?: number;
};

type StreakState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "ready"; days: number; activeDates: Set<string>; week: string[] }
  | { status: "error" };

const NAV_ICONS: Record<string, ReactNode> = {
  home: <HomeIcon />,
  explore: <AlgorithmsIcon />,
  paths: <LabBookIcon />,
  lab: <VisualizerIcon />,
  challenges: <ChallengesIcon />,
  compare: <CompareIcon />,
  progress: <ProgressIcon />,
  saved: <BookmarksIcon />,
  bookmarks: <BookmarksIcon />,
  activity: <HistoryIcon />,
  history: <HistoryIcon />,
  settings: <SettingsIcon />,
  search: <LabSearchIcon />,
  flask: <LabFlaskIcon />,
  trophy: <LabTrophyIcon />,
  learning: <ProgressIcon />,
  recent: <HistoryIcon />,
};

const INTERACTIVE_LAB_NAVIGATION: NavigationGroup[] = [
  {
    id: "lab-primary",
    label: "",
    items: [
      { href: "/", label: "Home", icon: "home" },
      { href: "/algorithms", label: "Explore", icon: "search" },
      { href: "/learning-paths", label: "Learning Paths", icon: "paths" },
    ],
  },
  {
    id: "lab-practice",
    label: "PRACTICE",
    items: [
      { href: "/visualizer", label: "Interactive Lab", icon: "flask" },
      { href: "/challenges", label: "Challenges", icon: "trophy" },
      { href: "/compare", label: "Compare", icon: "compare" },
    ],
  },
  {
    id: "lab-my-space",
    label: "MY SPACE",
    items: [
      { href: "/progress", label: "My Learning", icon: "learning" },
      { href: "/favorites", label: "Saved Items", icon: "saved" },
      { href: "/activity", label: "Recent Activity", icon: "recent" },
    ],
  },
  {
    id: "settings",
    label: "",
    items: [{ href: "/settings", label: "Settings", icon: "settings" }],
  },
];

function LabSearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="7.1" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function LabBookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22V5.5ZM21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22V5.5Z" />
    </svg>
  );
}

function LabFlaskIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3h6M10 3v6l-5.5 9.2A1.9 1.9 0 0 0 6.1 21h11.8a1.9 1.9 0 0 0 1.6-2.8L14 9V3" />
      <path d="M7.7 16h8.6M10 13h4" />
    </svg>
  );
}

function LabTrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v3m-4 2h8" />
    </svg>
  );
}

function LabBrandMark() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" fill="none" aria-hidden="true">
      <path
        d="M24 3.8 42 14v20L24 44.2 6 34V14L24 3.8Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="m18 17-7 7 7 7m12-14 7 7-7 7m-3-19-6 24"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function dateKey(value: string | Date | undefined): string | null {
  if (!value) return null;
  const raw = value instanceof Date ? value.toISOString() : String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function makeWeekKeys(now = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6 + index)
    );
    return date.toISOString().slice(0, 10);
  });
}

function getCurrentStreak(activeDates: Set<string>, week: string[]): number {
  if (!week.length) return 0;
  let cursor = week[week.length - 1]!;
  if (!activeDates.has(cursor)) {
    const yesterday = new Date(`${cursor}T00:00:00.000Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    cursor = yesterday.toISOString().slice(0, 10);
    if (!activeDates.has(cursor)) return 0;
  }

  let streak = 0;
  const day = new Date(`${cursor}T00:00:00.000Z`);
  while (activeDates.has(day.toISOString().slice(0, 10))) {
    streak += 1;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return streak;
}

export function Sidebar({ open, onNavigate }: Readonly<{ open: boolean; onNavigate: () => void }>) {
  const pathname = usePathname();
  const isVisualizerArea = pathname === "/visualizer" || pathname.startsWith("/visualizer/");
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [streak, setStreak] = useState<StreakState>({ status: "loading" });
  const groups = isVisualizerArea ? INTERACTIVE_LAB_NAVIGATION : navigationGroups;

  useEffect(() => {
    if (isVisualizerArea) return;

    let cancelled = false;
    fetch("/api/activity?days=365", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled)
            setStreak(
              response.status === 401 || response.status === 400
                ? { status: "guest" }
                : { status: "error" }
            );
          return;
        }
        const data = (await response.json()) as { days?: ActivityDay[] };
        if (cancelled) return;
        const activeDates = new Set(
          (data.days ?? [])
            .filter((day) => Number(day.ActivityCount ?? day.activityCount ?? 0) > 0)
            .map((day) => dateKey(day.ActivityDate ?? day.activityDate))
            .filter((value): value is string => Boolean(value))
        );
        const week = makeWeekKeys();
        setStreak({
          status: "ready",
          days: getCurrentStreak(activeDates, week),
          activeDates,
          week,
        });
      })
      .catch(() => {
        if (!cancelled) setStreak({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [isVisualizerArea, pathname]);

  useEffect(() => {
    if (open) {
      sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    } else if (sidebarRef.current?.contains(document.activeElement)) {
      document.getElementById("mobile-menu-button")?.focus();
    }
  }, [open]);

  const streakLabel = useMemo(() => {
    if (streak.status !== "ready") return "";
    return `${streak.days} ${streak.days === 1 ? "day" : "days"}`;
  }, [streak]);

  return (
    <aside
      ref={sidebarRef}
      id="primary-navigation"
      className="app-sidebar"
      data-open={open}
      style={isVisualizerArea ? { display: "flex", flexDirection: "column" } : undefined}
      aria-label="Primary navigation"
    >
      <Link href="/" className="sidebar-brand" aria-label="LogicLab home" onClick={onNavigate}>
        <span className="sidebar-brand__mark" aria-hidden="true">
          <LabBrandMark />
        </span>
        <span className="sidebar-brand__copy">
          <strong>
            <span>Logic</span>
            <em>Lab</em>
          </strong>
          <small>Algorithm Laboratory</small>
        </span>
      </Link>

      <nav
        className="sidebar-navigation"
        aria-label="Main navigation"
        style={isVisualizerArea ? { display: "flex", flex: 1, flexDirection: "column" } : undefined}
      >
        {groups.map((group) => (
          <section
            className="nav-group"
            key={group.id ?? group.items[0]?.href ?? "nav-group"}
            style={isVisualizerArea && group.id === "settings" ? { marginTop: "auto" } : undefined}
          >
            {group.label && <h2>{group.label}</h2>}
            <div className="nav-list">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/algorithms"
                      ? pathname === "/algorithms" ||
                        pathname.startsWith("/algorithms/") ||
                        pathname === "/data-structures" ||
                        pathname.startsWith("/data-structures/") ||
                        pathname === "/search"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`nav-item ${active ? "nav-item--active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <span className="nav-item__icon" aria-hidden="true">
                      {NAV_ICONS[item.icon]}
                    </span>
                    <span className="nav-item__label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {!isVisualizerArea ? (
        <section className="sidebar-streak" aria-label="Learning streak">
          <div className="sidebar-streak__heading">
            <span aria-hidden="true">🔥</span>
            <div>
              <strong>Learning Streak</strong>
              {streak.status === "ready" ? (
                <b>{streakLabel}</b>
              ) : streak.status === "guest" ? (
                <span>Sign in to track your streak</span>
              ) : streak.status === "error" ? (
                <span>Activity unavailable</span>
              ) : (
                <span>Checking activity…</span>
              )}
            </div>
          </div>
          <div className="sidebar-streak__week" aria-label="Activity during the last seven days">
            {(streak.status === "ready" ? streak.week : makeWeekKeys()).map((day) => {
              const active = streak.status === "ready" && streak.activeDates.has(day);
              const label = new Date(`${day}T00:00:00.000Z`).toLocaleDateString("en", {
                weekday: "short",
                timeZone: "UTC",
              });
              return (
                <span
                  className={active ? "is-active" : ""}
                  key={day}
                  title={`${label}: ${active ? "Activity recorded" : "No activity recorded"}`}
                >
                  <i aria-hidden="true">{active ? "✓" : "·"}</i>
                  <small>{label.slice(0, 1)}</small>
                </span>
              );
            })}
          </div>
          {streak.status === "guest" ? (
            <Link href="/login" className="sidebar-streak__link" onClick={onNavigate}>
              Sign in to begin →
            </Link>
          ) : null}
        </section>
      ) : null}
    </aside>
  );
}
