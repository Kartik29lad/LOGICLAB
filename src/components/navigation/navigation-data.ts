export type NavigationItem = { href: string; label: string; icon: string };
export type NavigationGroup = { id?: string; label: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { id: "home", label: "", items: [{ href: "/", label: "Home", icon: "⌂" }] },
  {
    id: "explore",
    label: "Explore",
    items: [
      { href: "/algorithms", label: "Algorithms", icon: "◇" },
      { href: "/data-structures", label: "Data Structures", icon: "▦" },
      { href: "/visualizer", label: "Visualizer", icon: "◉" },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      { href: "/challenges", label: "Challenges", icon: "◆" },
      { href: "/compare", label: "Compare", icon: "⇄" },
    ],
  },
  {
    id: "learning",
    label: "My Learning",
    items: [
      { href: "/progress", label: "Progress", icon: "◒" },
      { href: "/history", label: "History", icon: "◷" },
      { href: "/favorites", label: "Favorites", icon: "☆" },
      { href: "/bookmarks", label: "Bookmarks", icon: "🔖" },
      { href: "/activity", label: "Activity", icon: "▥" },
    ],
  },
  { id: "settings", label: "", items: [{ href: "/settings", label: "Settings", icon: "⚙" }] },
];
