export const examples = [
  {
    id: "trie-basic",
    title: "Basic example",
    description: "A prefix tree that stores strings by sharing common character paths.",
    input: {
      description: "representative input",
    },
    output: "The updated prefix tree and lookup result.",
    explanation: "Store one character per edge so prefixes become shared paths.",
  },
  {
    id: "trie-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
