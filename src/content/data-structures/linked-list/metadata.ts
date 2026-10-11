import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.linked-list",
  type: "DATA_STRUCTURE",
  slug: "linked-list",
  title: "Linked List",
  summary: "A sequence of nodes connected through next references.",
  description: "A sequence of nodes connected through next references.",
  category: "data-structures",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Linked List.",
    "Predict important execution steps for Linked List.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array", "stack", "queue"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "linked-list-basic",
      title: "Basic example",
      description: "A sequence of nodes connected through next references.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Store each value in a node that points to the next node.",
    },
  ],
  commonMistakes: [
    "Applying Linked List without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "stack",
      relationship: "PREREQUISITE",
    },
    {
      slug: "queue",
      relationship: "PREREQUISITE",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/linked-list",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "singly-linked-list",
  visualizationType: "linked-list",
  tags: ["data-structures", "beginner", "data-structures"],
  mainIdea: "Store each value in a node that points to the next node.",
  howItWorks: [
    "Create a node for a value.",
    "Connect the node to its successor.",
    "Update the head or tail links for insertion/removal.",
    "Traverse by following next references.",
  ],
  whyItWorks: "Links allow structural insertion without shifting every later element.",
  useCases: [
    "Dynamic sequences",
    "Pointer/reference teaching",
    "Building blocks for other structures",
  ],
  supportedInputs: ["Node values", "Reference-based links"],
  properties: ["Dynamic links", "Sequential traversal", "No constant-time random access"],
  terminology: [
    {
      term: "node",
      definition: "A value plus a link to another node.",
      example: "value + next",
    },
  ],
  formulas: ["next(node_i) = node_{i+1}."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.linked-list.predict-next-step"],
  stepExplanations: [
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
    {
      event: "REMOVE",
      explanation: "The execution performs remove as part of the current step.",
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
