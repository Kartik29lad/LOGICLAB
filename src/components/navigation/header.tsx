import Link from "next/link";

import { CloseIcon, MenuIcon, SearchIcon, SettingsIcon } from "./icons";

export function Header({
  onMenuClick,
  menuOpen,
}: Readonly<{ onMenuClick: () => void; menuOpen: boolean }>) {
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
          L
        </span>
        <span className="brand__text">
          <strong>LogicLab</strong>
          <small>Explore. Visualize. Understand.</small>
        </span>
      </Link>
      <form className="header-search" role="search" action="/search">
        <span className="header-search__icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          id="global-search-input"
          name="q"
          aria-label="Search LogicLab"
          placeholder="Search algorithms, data structures..."
          autoComplete="off"
        />
        <kbd className="header-search__kbd" aria-hidden="true">
          ⌘ K
        </kbd>
      </form>
      <nav className="header-actions" aria-label="Global actions">
        <Link href="/history" className="button button--ghost">
          History
        </Link>
        <Link href="/progress" className="button button--ghost">
          Progress
        </Link>
        <Link href="/settings" className="button button--icon button--ghost" aria-label="Settings">
          <SettingsIcon />
        </Link>
      </nav>
    </header>
  );
}
