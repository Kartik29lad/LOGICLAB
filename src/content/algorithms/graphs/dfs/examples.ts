export const examples = [
  {
    id: "dfs-basic",
    title: "Basic example",
    description: "A graph traversal that explores deeply before backtracking.",
    input: {
      description: "representative input",
    },
    output: "Traversal order from the chosen start node.",
    explanation:
      "Follow one branch as far as possible before returning to an earlier decision point.",
  },
  {
    id: "dfs-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
