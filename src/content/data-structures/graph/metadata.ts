import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.graph",
  type: "DATA_STRUCTURE",
  slug: "graph",
  title: "Graph",
  summary: "A collection of nodes connected by directed or undirected weighted edges.",
  description: "A collection of nodes connected by directed or undirected weighted edges.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Graph.",
    "Predict important execution steps for Graph.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: [],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(V + E)",
  },
  examples: [
    {
      id: "graph-basic",
      title: "Basic example",
      description: "A collection of nodes connected by directed or undirected weighted edges.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Represent relationships between entities as vertices and edges.",
    },
  ],
  commonMistakes: [
    "Applying Graph without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "bfs",
      relationship: "NEXT",
    },
    {
      slug: "dfs",
      relationship: "NEXT",
    },
    {
      slug: "dijkstra",
      relationship: "RELATED",
    },
    {
      slug: "a-star",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/graph",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "graph",
  visualizationType: "graph",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Represent relationships between entities as vertices and edges.",
  howItWorks: [
    "Add nodes.",
    "Add directed or undirected edges.",
    "Optionally assign non-negative weights.",
    "Traverse or analyze the graph with an algorithm.",
  ],
  whyItWorks: "Graphs model arbitrary many-to-many relationships without forcing a hierarchy.",
  useCases: ["Networks", "Maps", "Dependency relationships", "Graph algorithms"],
  supportedInputs: ["Node identifiers", "Edges", "Optional non-negative weights"],
  properties: ["Directed or undirected", "Weighted or unweighted", "Cycles allowed"],
  terminology: [
    {
      term: "vertex",
      definition: "A graph node.",
      example: "A",
    },
    {
      term: "edge",
      definition: "A connection between vertices.",
      example: "A -> B",
    },
  ],
  formulas: ["For adjacency traversal, inspect the neighbors of the current node."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.graph.predict-next-step"],
  stepExplanations: [
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
    {
      event: "READ",
      explanation: "The execution performs read as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
