export const explanation =
  "Store one character per edge so prefixes become shared paths.\\n\\nStart at the root. Follow or create the child for each character. Mark the final node as a complete word. Search or prefix-check by following the same character path. Searching a word follows one character per level, making cost depend on key length rather than the number of stored words.";
