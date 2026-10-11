export type AchievementRuleType =
  "FIRST_EXECUTION" | "COMPLETED_CONCEPTS" | "CHALLENGE_MILESTONE" | "STREAK" | "BREADTH" | "DEPTH";

export interface AchievementRule {
  type: AchievementRuleType;
  threshold?: number;
  contentType?: "ALGORITHM" | "DATA_STRUCTURE" | "CHALLENGE";
  category?: string;
}

export const DEFAULT_ACHIEVEMENT_RULES: readonly {
  code: string;
  name: string;
  description: string;
  category: string;
  criteria: AchievementRule;
}[] = [
  {
    code: "FIRST_EXECUTION",
    name: "First Run",
    description: "Execute your first algorithm or data structure.",
    category: "STARTER",
    criteria: { type: "FIRST_EXECUTION" },
  },
  {
    code: "FIVE_CONCEPTS",
    name: "Five Concepts",
    description: "Complete five algorithms or data structures.",
    category: "PROGRESS",
    criteria: { type: "COMPLETED_CONCEPTS", threshold: 5 },
  },
  {
    code: "TEN_CONCEPTS",
    name: "Ten Concepts",
    description: "Complete ten algorithms or data structures.",
    category: "PROGRESS",
    criteria: { type: "COMPLETED_CONCEPTS", threshold: 10 },
  },
  {
    code: "FIRST_CHALLENGE",
    name: "Challenge Accepted",
    description: "Complete your first challenge.",
    category: "PRACTICE",
    criteria: { type: "CHALLENGE_MILESTONE", threshold: 1 },
  },
  {
    code: "FIVE_CHALLENGES",
    name: "Practice Builder",
    description: "Complete five challenges.",
    category: "PRACTICE",
    criteria: { type: "CHALLENGE_MILESTONE", threshold: 5 },
  },
  {
    code: "THREE_DAY_STREAK",
    name: "Three-Day Streak",
    description: "Learn on three consecutive days.",
    category: "CONSISTENCY",
    criteria: { type: "STREAK", threshold: 3 },
  },
  {
    code: "BREADTH_TWO_CATEGORIES",
    name: "Explore Broadly",
    description: "Complete concepts across at least two categories.",
    category: "BREADTH",
    criteria: { type: "BREADTH", threshold: 2 },
  },
  {
    code: "DEPTH_PATH",
    name: "Path Finisher",
    description: "Complete an entire learning path.",
    category: "DEPTH",
    criteria: { type: "DEPTH", threshold: 1 },
  },
];
