/**
 * Canonical Application Paths and API Route Identifiers
 */

export const ROUTES = {
  home: "/",
  algorithms: "/algorithms",
  algorithmDetail: (slug: string) => `/algorithms/${slug}`,
  dataStructures: "/data-structures",
  dataStructureDetail: (slug: string) => `/data-structures/${slug}`,
  visualizer: (slug: string) => `/visualizer/${slug}`,
  challenges: "/challenges",
  challengeDetail: (id: string) => `/challenges/${id}`,
  compare: "/compare",
  experiments: "/experiments",
  progress: "/progress",
  history: "/history",
  favorites: "/favorites",
  learningPaths: "/learning",
  settings: "/settings",
  auth: {
    login: "/login",
    register: "/register",
  },
} as const;

export const API_ROUTES = {
  health: "/api/health",
  live: "/live",
  ready: "/ready",
  algorithms: "/api/algorithms",
  dataStructures: "/api/data-structures",
  execution: "/api/execution",
  challenges: "/api/challenges",
  progress: "/api/progress",
  history: "/api/history",
  favorites: "/api/favorites",
  experiments: "/api/experiments",
  bookmarks: "/api/bookmarks",
  learningPaths: "/api/learning-paths",
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    register: "/api/auth/register",
    session: "/api/auth/session",
  },
} as const;
