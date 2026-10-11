import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.a-star",
  type: "ALGORITHM",
  slug: "a-star",
  title: "A*",
  summary:
    "A heuristic shortest-path search that ranks frontier nodes by path cost plus estimated remaining cost.",
  description:
    "A heuristic shortest-path search that ranks frontier nodes by path cost plus estimated remaining cost.",
  category: "graphs",
  difficulty: "ADVANCED",
  learningObjectives: [
    "Explain the main idea of A*.",
    "Predict important execution steps for A*.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["graph"],
  complexity: {
    timeBest: "O(E)",
    timeAverage: "O(E log V)",
    timeWorst: "O(V² + E)",
    space: "O(V)",
  },
  examples: [
    {
      id: "a-star-basic",
      title: "Basic example",
      description:
        "A heuristic shortest-path search that ranks frontier nodes by path cost plus estimated remaining cost.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Prioritize the frontier node with the smallest f(n)=g(n)+h(n).",
    },
  ],
  commonMistakes: [
    "Applying A* without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "graph",
      relationship: "PREREQUISITE",
    },
    {
      slug: "dijkstra",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/a-star",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "a-star",
  visualizationType: "graph",
  tags: ["graphs", "advanced", "algorithms"],
  mainIdea: "Prioritize the frontier node with the smallest f(n)=g(n)+h(n).",
  howItWorks: [
    "Set the start node cost to zero.",
    "Compute f = g + h for frontier nodes.",
    "Choose the lowest-f frontier node.",
    "Relax its neighbors and update parent/cost data.",
    "Stop when the target is selected or the frontier is exhausted.",
  ],
  whyItWorks:
    "An admissible and consistent heuristic preserves optimality while guiding the search toward the target.",
  useCases: ["Pathfinding", "Game navigation", "Heuristic search teaching"],
  supportedInputs: [
    "Graph with non-negative weights",
    "Start and target nodes",
    "Admissible/consistent heuristic for optimality",
  ],
  properties: ["Heuristic-guided", "Can outperform uninformed search when the heuristic is useful"],
  terminology: [
    {
      term: "heuristic",
      definition: "An estimate of remaining cost to the target.",
      example: "h(n)",
    },
    {
      term: "frontier",
      definition: "Discovered nodes not fully expanded yet.",
      example: "open set",
    },
  ],
  formulas: ["f(n) = g(n) + h(n).", "Relax when g(current) + weight < g(neighbor)."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.a-star.predict-next-step"],
  stepExplanations: [
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
    {
      event: "RELAX",
      explanation: "The execution performs relax as part of the current step.",
    },
    {
      event: "UPDATE_DISTANCE",
      explanation: "The execution performs update distance as part of the current step.",
    },
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
