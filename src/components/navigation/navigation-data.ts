export type NavigationItem = { href: string; label: string; icon: string };
export type NavigationGroup = { id?: string; label: string; items: NavigationItem[] };

/** Primary product navigation, grouped by the learner's workflow. */
export const navigationGroups: NavigationGroup[] = [
  {
    id: "learn",
    label: "",
    items: [
      { href: "/", label: "Home", icon: "home" },
      { href: "/algorithms", label: "Explore", icon: "explore" },
      { href: "/learning-paths", label: "Learning Paths", icon: "paths" },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      { href: "/visualizer", label: "Interactive Lab", icon: "lab" },
      { href: "/challenges", label: "Challenges", icon: "challenges" },
      { href: "/compare", label: "Compare", icon: "compare" },
    ],
  },
  {
    id: "my-space",
    label: "My Space",
    items: [
      { href: "/progress", label: "My Learning", icon: "progress" },
      { href: "/favorites", label: "Saved Items", icon: "saved" },
      { href: "/activity", label: "Recent Activity", icon: "activity" },
    ],
  },
  {
    id: "settings",
    label: "",
    items: [{ href: "/settings", label: "Settings", icon: "settings" }],
  },
];
