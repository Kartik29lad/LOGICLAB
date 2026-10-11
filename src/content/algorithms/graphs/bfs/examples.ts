export const examples = [
  {
    id: "bfs-basic",
    title: "Basic example",
    description: "A graph traversal that explores nodes level by level with a queue.",
    input: {
      description: "representative input",
    },
    output: "Traversal order plus predecessor and unweighted distance maps.",
    explanation:
      "Visit the nearest undiscovered neighbors before moving to the next distance level.",
  },
  {
    id: "bfs-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
