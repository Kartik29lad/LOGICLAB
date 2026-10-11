export const examples = [
  {
    id: "dijkstra-basic",
    title: "Basic example",
    description: "A shortest-path algorithm for graphs with non-negative edge weights.",
    input: {
      description: "representative input",
    },
    output: "Shortest-distance and predecessor maps; paths can be reconstructed from predecessors.",
    explanation: "Repeatedly finalize the closest unsettled node and relax its outgoing edges.",
  },
  {
    id: "dijkstra-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
