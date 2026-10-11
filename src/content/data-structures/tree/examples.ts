export const examples = [
  {
    id: "tree-basic",
    title: "Basic example",
    description: "A hierarchical structure of nodes connected by parent-child relationships.",
    input: {
      description: "representative input",
    },
    output: "The updated hierarchy.",
    explanation: "Represent hierarchy with a root and zero or more children per node.",
  },
  {
    id: "tree-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
