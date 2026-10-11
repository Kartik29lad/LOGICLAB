export const examples = [
  {
    id: "array-basic",
    title: "Basic example",
    description: "An indexed sequence with constant-time direct access by position.",
    input: [7, 3, 9, 2, 5],
    output: "The updated array values.",
    explanation: "Store values in indexed positions so a known index can be accessed directly.",
  },
  {
    id: "array-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
