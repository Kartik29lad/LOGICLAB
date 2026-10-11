import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.tree",
  type: "DATA_STRUCTURE",
  slug: "tree",
  title: "Tree",
  summary: "A hierarchical structure of nodes connected by parent-child relationships.",
  description: "A hierarchical structure of nodes connected by parent-child relationships.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Tree.",
    "Predict important execution steps for Tree.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["graph"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "tree-basic",
      title: "Basic example",
      description: "A hierarchical structure of nodes connected by parent-child relationships.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Represent hierarchy with a root and zero or more children per node.",
    },
  ],
  commonMistakes: [
    "Applying Tree without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "binary-search-tree",
      relationship: "NEXT",
    },
    {
      slug: "trie",
      relationship: "RELATED",
    },
    {
      slug: "graph",
      relationship: "PREREQUISITE",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/tree",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "tree",
  visualizationType: "tree",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Represent hierarchy with a root and zero or more children per node.",
  howItWorks: [
    "Create a root node.",
    "Attach child nodes to a parent.",
    "Traverse from the root.",
    "Use a traversal strategy to visit descendants.",
  ],
  whyItWorks: "Parent-child links model nested relationships without requiring a flat sequence.",
  useCases: ["Hierarchical data", "DOM-like structures", "Tree algorithm foundations"],
  supportedInputs: ["Rooted nodes", "Parent-child relationships"],
  properties: ["Acyclic hierarchy", "One root in this model"],
  terminology: [
    {
      term: "root",
      definition: "The top node with no parent.",
      example: "tree.root",
    },
  ],
  formulas: ["Each non-root node has exactly one parent in a rooted tree."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.tree.predict-next-step"],
  stepExplanations: [
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
