"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ActivityIcon,
  AlgorithmsIcon,
  BookmarksIcon,
  ChallengesIcon,
  CompareIcon,
  FavoritesIcon,
  HistoryIcon,
  HomeIcon,
  ProgressIcon,
  SettingsIcon,
  VisualizerIcon,
} from "@/components/navigation/icons";
import { navigationGroups } from "@/components/navigation/navigation-data";

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

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: <HomeIcon />,
  explore: <AlgorithmsIcon />,
  paths: <BookmarksIcon />,
  lab: <VisualizerIcon />,
  challenges: <ChallengesIcon />,
  compare: <CompareIcon />,
  progress: <ProgressIcon />,
  saved: <FavoritesIcon />,
  bookmarks: <BookmarksIcon />,
  activity: <ActivityIcon />,
  history: <HistoryIcon />,
  settings: <SettingsIcon />,
};

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
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [streak, setStreak] = useState<StreakState>({ status: "loading" });

  useEffect(() => {
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
  }, []);

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
      aria-label="Primary navigation"
    >
      <Link href="/" className="sidebar-brand" aria-label="LogicLab home" onClick={onNavigate}>
        <span className="sidebar-brand__mark" aria-hidden="true">
          ⌬
        </span>
        <span className="sidebar-brand__copy">
          <strong>LogicLab</strong>
          <small>Algorithm Laboratory</small>
        </span>
      </Link>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        {navigationGroups.map((group) => (
          <section className="nav-group" key={group.id ?? group.items[0]?.href ?? "nav-group"}>
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
    </aside>
  );
}
