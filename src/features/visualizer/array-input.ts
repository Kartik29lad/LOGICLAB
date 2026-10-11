export const MAX_INTERACTIVE_ARRAY_LENGTH = 100;

export interface ArrayInputPreset {
  id: string;
  label: string;
  values: number[];
  target?: number;
}

export const ARRAY_INPUT_PRESETS: ArrayInputPreset[] = [
  { id: "classic", label: "Classic", values: [7, 3, 9, 2, 5], target: 9 },
  { id: "search-ready", label: "Search ready", values: [2, 5, 7, 9, 13, 18, 21], target: 9 },
  { id: "nearly-sorted", label: "Nearly sorted", values: [1, 2, 4, 3, 5], target: 4 },
  { id: "reverse", label: "Reverse order", values: [9, 7, 5, 3, 1], target: 5 },
  { id: "duplicates", label: "Duplicates", values: [4, 2, 4, 1, 2], target: 4 },
  { id: "small", label: "Small", values: [3, 1, 2], target: 2 },
];

export function formatArrayInput(values: readonly number[]): string {
  return values.join(", ");
}

export function parseArrayInput(value: string): { values?: number[]; error?: string } {
  const tokens = value
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length > MAX_INTERACTIVE_ARRAY_LENGTH) {
    return {
      error: `Use at most ${MAX_INTERACTIVE_ARRAY_LENGTH} values in the interactive visualizer.`,
    };
  }
  if (tokens.length === 0) return { values: [] };

  const values = tokens.map(Number);
  const invalidIndex = values.findIndex((number) => !Number.isFinite(number));
  if (invalidIndex >= 0) return { error: `Value ${invalidIndex + 1} is not a finite number.` };
  return { values };
}

export function validateArrayExperiment(
  slug: string,
  values: readonly number[],
  target: number | undefined
): string | null {
  if (values.length > MAX_INTERACTIVE_ARRAY_LENGTH)
    return `Use at most ${MAX_INTERACTIVE_ARRAY_LENGTH} values.`;
  if (slug === "binary-search" && !isSortedAscending(values))
    return "Binary Search requires the array to be sorted in ascending order.";
  if ((slug === "linear-search" || slug === "binary-search") && !Number.isFinite(target))
    return "Enter a finite target value before running this search.";
  return null;
}

export function isSortedAscending(values: readonly number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1]! > values[index]!) return false;
  }
  return true;
}

export function defaultArrayInput(slug: string): ArrayInputPreset {
  return slug === "binary-search"
    ? ARRAY_INPUT_PRESETS.find((preset) => preset.id === "search-ready")!
    : ARRAY_INPUT_PRESETS[0]!;
}
