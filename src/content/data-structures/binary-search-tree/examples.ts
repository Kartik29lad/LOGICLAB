export const examples = [
  {
    id: "binary-search-tree-basic",
    title: "Basic example",
    description: "A binary tree that keeps smaller values left and larger values right.",
    input: {
      description: "representative input",
    },
    output: "The updated tree or requested search/min/max result.",
    explanation: "Use ordered child relationships to search by repeatedly choosing one branch.",
  },
  {
    id: "binary-search-tree-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
