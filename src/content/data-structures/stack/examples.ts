export const examples = [
  {
    id: "stack-basic",
    title: "Basic example",
    description: "A LIFO collection where the most recently pushed item is removed first.",
    input: {
      description: "representative input",
    },
    output: "The current stack contents and optional popped/peeked value.",
    explanation: "Add and remove items from one end called the top.",
  },
  {
    id: "stack-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
