"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ActivityIcon,
  AlgorithmsIcon,
  BookmarksIcon,
  ChallengesIcon,
  CompareIcon,
  DataStructuresIcon,
  FavoritesIcon,
  HistoryIcon,
  HomeIcon,
  ProgressIcon,
  SettingsIcon,
  VisualizerIcon,
} from "@/components/navigation/icons";
import { navigationGroups } from "@/components/navigation/navigation-data";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": <HomeIcon />,
  "/algorithms": <AlgorithmsIcon />,
  "/data-structures": <DataStructuresIcon />,
  "/visualizer": <VisualizerIcon />,
  "/challenges": <ChallengesIcon />,
  "/compare": <CompareIcon />,
  "/progress": <ProgressIcon />,
  "/history": <HistoryIcon />,
  "/favorites": <FavoritesIcon />,
  "/bookmarks": <BookmarksIcon />,
  "/activity": <ActivityIcon />,
  "/settings": <SettingsIcon />,
};

export function Sidebar({ open, onNavigate }: Readonly<{ open: boolean; onNavigate: () => void }>) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    } else if (sidebarRef.current?.contains(document.activeElement)) {
      /* Targets id="mobile-menu-button" */
      document.getElementById("mobile-menu-button")?.focus();
    }
  }, [open]);

  return (
    <aside
      ref={sidebarRef}
      id="primary-navigation"
      className="app-sidebar"
      data-open={open}
      aria-label="Primary navigation"
    >
      {navigationGroups.map((group) => (
        <section
          className="nav-group"
          key={group.id ?? group.label ?? group.items[0]?.href ?? "nav-group"}
        >
          {group.label && <h2>{group.label}</h2>}
          <div className="nav-list">
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
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
                    {NAV_ICONS[item.href] ?? item.icon}
                  </span>
                  <span className="nav-item__label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <div className="sidebar-note">
        <strong>Interactive laboratory</strong>
        <span>Learn by seeing each step.</span>
      </div>
    </aside>
  );
}
