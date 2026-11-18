import Link from "next/link";

import { CloseIcon, MenuIcon, SearchIcon } from "./icons";

function NotificationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export function Header({
  onMenuClick,
  menuOpen,
  searchAction = "/search",
}: Readonly<{ onMenuClick: () => void; menuOpen: boolean; searchAction?: string }>) {
  return (
    <header className="app-header">
      <button
        id="mobile-menu-button"
        className="button button--ghost button--icon mobile-menu"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={onMenuClick}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <Link href="/" className="brand" aria-label="LogicLab home">
        <span className="brand__mark" aria-hidden="true">
          ⌬
        </span>
        <span className="brand__text">
          <strong>LogicLab</strong>
          <small>Explore. Visualize. Understand.</small>
        </span>
      </Link>
      <form className="header-search" role="search" action={searchAction}>
        <span className="header-search__icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          id="global-search-input"
          name="q"
          aria-label="Search LogicLab"
          placeholder="Search algorithms, data structures, topics..."
          autoComplete="off"
        />
        <kbd className="header-search__kbd" aria-hidden="true">
          Ctrl K
        </kbd>
      </form>
      <nav className="header-actions" aria-label="Global actions">
        <Link
          href="/activity"
          className="header-icon-link"
          aria-label="Notifications and recent activity"
          title="Notifications"
        >
          <NotificationIcon />
        </Link>
        <Link
          href="/settings"
          className="header-account"
          aria-label="Account settings"
          title="Account settings"
        >
          <span className="header-account__avatar" aria-hidden="true">
            A
          </span>
          <ChevronDownIcon />
        </Link>
      </nav>
    </header>
  );
}
