import type { ContentPackage } from "../../schema/content-types";
import { metadata } from "./metadata";

export const content: ContentPackage = {
  metadata,
  explanation: "Start with unweighted traversal, then move into weighted and heuristic search.",
  learningPath: { order: 3, itemSlugs: ["bfs", "dfs", "dijkstra", "a-star"] },
};
