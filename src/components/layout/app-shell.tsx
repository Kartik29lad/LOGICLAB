"use client";

import { useEffect, useState } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/navigation/header";
import { Sidebar } from "@/components/navigation/sidebar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings) => {
        if (!cancelled && settings)
          document.documentElement.dataset.reducedMotion = settings.ReducedMotion
            ? "true"
            : "false";
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search without stealing from editable controls
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        const active = document.activeElement;
        const isEditable =
          active instanceof HTMLElement &&
          (active.tagName === "TEXTAREA" ||
            (active.tagName === "INPUT" && active.id !== "global-search-input") ||
            active.tagName === "SELECT" ||
            active.isContentEditable);
        if (isEditable) return;

        event.preventDefault();
        const searchInput = document.getElementById(
          "global-search-input"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Handle Escape key and overlay scroll locking
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} menuOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      <button
        type="button"
        className="shell-backdrop"
        data-open={sidebarOpen}
        aria-label="Close navigation"
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={closeSidebar}
      />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <div className="app-main-inner">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
