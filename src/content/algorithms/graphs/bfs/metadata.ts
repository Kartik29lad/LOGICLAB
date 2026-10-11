import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.bfs",
  type: "ALGORITHM",
  slug: "bfs",
  title: "Breadth-First Search",
  summary: "A graph traversal that explores nodes level by level with a queue.",
  description: "A graph traversal that explores nodes level by level with a queue.",
  category: "graphs",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Breadth-First Search.",
    "Predict important execution steps for Breadth-First Search.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["graph", "queue"],
  complexity: {
    timeBest: "O(V + E)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
  },
  examples: [
    {
      id: "bfs-basic",
      title: "Basic example",
      description: "A graph traversal that explores nodes level by level with a queue.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation:
        "Visit the nearest undiscovered neighbors before moving to the next distance level.",
    },
  ],
  commonMistakes: [
    "Applying Breadth-First Search without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "graph",
      relationship: "PREREQUISITE",
    },
    {
      slug: "queue",
      relationship: "PREREQUISITE",
    },
    {
      slug: "dfs",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/bfs",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "bfs",
  visualizationType: "graph",
  tags: ["graphs", "intermediate", "algorithms"],
  mainIdea: "Visit the nearest undiscovered neighbors before moving to the next distance level.",
  howItWorks: [
    "Enqueue the start node and mark it visited.",
    "Dequeue the next node.",
    "Inspect its neighbors.",
    "Discover and enqueue each unvisited neighbor.",
    "Repeat until the queue is empty.",
  ],
  whyItWorks:
    "The queue preserves discovery order, so nodes are processed in nondecreasing unweighted distance from the start.",
  useCases: [
    "Unweighted shortest paths",
    "Level-order graph exploration",
    "Connectivity discovery",
  ],
  supportedInputs: [
    "Directed or undirected graph",
    "Valid start node",
    "Unweighted traversal semantics",
  ],
  properties: ["Queue-based", "Finds shortest edge-count distance in unweighted graphs"],
  terminology: [
    {
      term: "frontier",
      definition: "The set of discovered nodes waiting to be processed.",
      example: "the queue",
    },
  ],
  formulas: ["distance[neighbor] = distance[current] + 1."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.bfs.predict-next-step"],
  stepExplanations: [
    {
      event: "ENQUEUE",
      explanation: "The execution performs enqueue as part of the current step.",
    },
    {
      event: "DEQUEUE",
      explanation: "The execution performs dequeue as part of the current step.",
    },
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "DISCOVER",
      explanation: "The execution performs discover as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
