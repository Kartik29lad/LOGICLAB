import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.dijkstra",
  type: "ALGORITHM",
  slug: "dijkstra",
  title: "Dijkstra",
  summary: "A shortest-path algorithm for graphs with non-negative edge weights.",
  description: "A shortest-path algorithm for graphs with non-negative edge weights.",
  category: "graphs",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Dijkstra.",
    "Predict important execution steps for Dijkstra.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["graph"],
  complexity: {
    timeBest: "O(V² + E)",
    timeAverage: "O(V² + E)",
    timeWorst: "O(V² + E)",
    space: "O(V)",
  },
  examples: [
    {
      id: "dijkstra-basic",
      title: "Basic example",
      description: "A shortest-path algorithm for graphs with non-negative edge weights.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Repeatedly finalize the closest unsettled node and relax its outgoing edges.",
    },
  ],
  commonMistakes: [
    "Applying Dijkstra without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "graph",
      relationship: "PREREQUISITE",
    },
    {
      slug: "bfs",
      relationship: "RELATED",
    },
    {
      slug: "a-star",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/dijkstra",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "dijkstra",
  visualizationType: "graph",
  tags: ["graphs", "intermediate", "algorithms"],
  mainIdea: "Repeatedly finalize the closest unsettled node and relax its outgoing edges.",
  howItWorks: [
    "Initialize source distance to zero and others to infinity.",
    "Select the unsettled node with the smallest distance.",
    "Relax each outgoing edge.",
    "Update a neighbor when a shorter route is found.",
    "Repeat until no reachable unsettled node remains.",
  ],
  whyItWorks:
    "With non-negative weights, the closest unsettled node cannot later receive a shorter path through another unsettled node.",
  useCases: ["Weighted shortest paths", "Routing foundations", "Network optimization concepts"],
  supportedInputs: ["Graph with non-negative weights", "Valid start node"],
  properties: ["Requires non-negative edge weights", "Produces shortest distances"],
  terminology: [
    {
      term: "relaxation",
      definition: "Testing whether a path through the current node improves a neighbor's distance.",
      example: "alt < distance[v]",
    },
  ],
  formulas: ["newDistance = distance[u] + weight(u,v).", "Update when newDistance < distance[v]."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.dijkstra.predict-next-step"],
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
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "UPDATE_DISTANCE",
      explanation: "The execution performs update distance as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
