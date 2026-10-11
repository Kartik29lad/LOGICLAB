export const examples = [
  {
    id: "graph-basic",
    title: "Basic example",
    description: "A collection of nodes connected by directed or undirected weighted edges.",
    input: {
      description: "representative input",
    },
    output: "The updated graph topology.",
    explanation: "Represent relationships between entities as vertices and edges.",
  },
  {
    id: "graph-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
