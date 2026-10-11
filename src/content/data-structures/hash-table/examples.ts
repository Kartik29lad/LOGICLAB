export const examples = [
  {
    id: "hash-table-basic",
    title: "Basic example",
    description: "A key-value structure that uses hashing to select a bucket.",
    input: {
      description: "representative input",
    },
    output: "The updated key-value mapping.",
    explanation: "Hash a key to a bucket and store or find the key within that bucket.",
  },
  {
    id: "hash-table-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
