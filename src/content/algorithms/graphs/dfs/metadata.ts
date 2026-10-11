import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.dfs",
  type: "ALGORITHM",
  slug: "dfs",
  title: "Depth-First Search",
  summary: "A graph traversal that explores deeply before backtracking.",
  description: "A graph traversal that explores deeply before backtracking.",
  category: "graphs",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Depth-First Search.",
    "Predict important execution steps for Depth-First Search.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["graph", "stack"],
  complexity: {
    timeBest: "O(V + E)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V)",
  },
  examples: [
    {
      id: "dfs-basic",
      title: "Basic example",
      description: "A graph traversal that explores deeply before backtracking.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation:
        "Follow one branch as far as possible before returning to an earlier decision point.",
    },
  ],
  commonMistakes: [
    "Applying Depth-First Search without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "graph",
      relationship: "PREREQUISITE",
    },
    {
      slug: "stack",
      relationship: "PREREQUISITE",
    },
    {
      slug: "bfs",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/dfs",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "dfs",
  visualizationType: "graph",
  tags: ["graphs", "intermediate", "algorithms"],
  mainIdea: "Follow one branch as far as possible before returning to an earlier decision point.",
  howItWorks: [
    "Start at the chosen node.",
    "Mark it visited.",
    "Select an unvisited neighbor.",
    "Continue recursively or via a stack.",
    "Backtrack when no unvisited neighbor remains.",
  ],
  whyItWorks:
    "A stack or recursion preserves the most recently discovered branch for continued exploration.",
  useCases: [
    "Connectivity",
    "Cycle-related exploration",
    "Topological-style traversal foundations",
  ],
  supportedInputs: ["Directed or undirected graph", "Valid start node"],
  properties: ["Depth-first exploration", "Uses recursion/stack semantics"],
  terminology: [
    {
      term: "backtracking",
      definition: "Returning to a previous node after exhausting a branch.",
      example: "return from a recursive call",
    },
  ],
  formulas: ["Visit node; recursively explore each unvisited neighbor."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.dfs.predict-next-step"],
  stepExplanations: [
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "DISCOVER",
      explanation: "The execution performs discover as part of the current step.",
    },
    {
      event: "BACKTRACK",
      explanation: "The execution performs backtrack as part of the current step.",
    },
    {
      event: "COMPLETE",
      explanation: "The execution performs complete as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
