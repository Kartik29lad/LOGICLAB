export const examples = [
  {
    id: "a-star-basic",
    title: "Basic example",
    description:
      "A heuristic shortest-path search that ranks frontier nodes by path cost plus estimated remaining cost.",
    input: {
      description: "representative input",
    },
    output: "A reconstructed path to the target when reachable, otherwise no path.",
    explanation: "Prioritize the frontier node with the smallest f(n)=g(n)+h(n).",
  },
  {
    id: "a-star-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
