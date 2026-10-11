import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.binary-search-tree",
  type: "DATA_STRUCTURE",
  slug: "binary-search-tree",
  title: "Binary Search Tree",
  summary: "A binary tree that keeps smaller values left and larger values right.",
  description: "A binary tree that keeps smaller values left and larger values right.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Binary Search Tree.",
    "Predict important execution steps for Binary Search Tree.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["tree"],
  complexity: {
    timeBest: "O(log n)",
    timeAverage: "O(log n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "binary-search-tree-basic",
      title: "Basic example",
      description: "A binary tree that keeps smaller values left and larger values right.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Use ordered child relationships to search by repeatedly choosing one branch.",
    },
  ],
  commonMistakes: [
    "Applying Binary Search Tree without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "tree",
      relationship: "PREREQUISITE",
    },
    {
      slug: "binary-search",
      relationship: "RELATED",
    },
    {
      slug: "trie",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/binary-search-tree",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "binary-search-tree",
  visualizationType: "tree",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Use ordered child relationships to search by repeatedly choosing one branch.",
  howItWorks: [
    "Compare the target with the current node.",
    "Go left when the target is smaller.",
    "Go right when it is larger.",
    "Stop when found or when the branch is empty.",
  ],
  whyItWorks:
    "The ordering property can eliminate half of a balanced tree's remaining candidates at each level.",
  useCases: ["Ordered sets", "Search-tree teaching", "Recursive tree algorithms"],
  supportedInputs: [
    "Comparable unique values in this implementation",
    "Insert/search/min/max operations",
  ],
  properties: [
    "Ordered",
    "No duplicate values in this implementation",
    "Performance depends on shape",
  ],
  terminology: [
    {
      term: "BST property",
      definition:
        "Left subtree values are smaller and right subtree values are larger than the node.",
      example: "left < node < right",
    },
  ],
  formulas: ["If target < node, search left; if target > node, search right."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.binary-search-tree.predict-next-step"],
  stepExplanations: [
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
    {
      event: "FOUND",
      explanation: "The execution performs found as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
