import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "learning-path-graph-algorithms",
  type: "LEARNING_PATH",
  slug: "graph-algorithms",
  title: "Graph Algorithms",
  summary: "Progress from graph traversal to weighted shortest paths and heuristic search.",
  description: "A structured graph path covering BFS, DFS, Dijkstra, and A*.",
  category: "GRAPHS",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Traverse graphs",
    "Track visited state",
    "Understand weighted shortest paths",
    "Understand heuristic-guided search",
  ],
  prerequisites: ["foundations"],
  examples: [
    {
      id: "graph-path-example",
      title: "Find a route",
      description: "Progress from traversal to shortest-path reasoning.",
      input: { start: "A", goal: "D" },
      output: ["A", "B", "D"],
    },
  ],
  commonMistakes: [
    "Forgetting visited state",
    "Using Dijkstra with negative edge weights",
    "Assuming A* is heuristic-free",
  ],
  relatedContent: [{ slug: "foundations", relationship: "PREREQUISITE" }],
  tags: ["learning-path", "graphs", "intermediate"],
  mainIdea: "Graph algorithms differ primarily in how they explore and prioritize frontier states.",
  howItWorks: [
    "Learn breadth-first traversal",
    "Learn depth-first traversal",
    "Add weighted shortest paths",
    "Add heuristic guidance",
  ],
  whyItWorks:
    "The progression makes frontier management and path-cost reasoning visible through increasingly capable algorithms.",
  useCases: ["Graph traversal", "Routing", "Pathfinding"],
  supportedInputs: ["Graphs", "Weighted graphs"],
  properties: ["Ordered progression", "Graph-aware"],
  terminology: [
    { term: "Frontier", definition: "The set of discovered states waiting to be explored." },
  ],
  formulas: ["path cost = sum of edge weights"],
  supportedLanguages: ["typescript"],
  practiceReferences: ["Run graph visualizations with the same start and goal"],
  stepExplanations: [
    {
      event: "ITEM_COMPLETED",
      explanation: "Graph reasoning advances to the next exploration strategy.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
