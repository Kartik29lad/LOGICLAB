/**
 * Flexible, resilient array parser for user input and scenario strings.
 * Handles comma-separated, space-separated, newline-separated, or JSON array strings.
 */

export interface ArrayParseResult {
  success: boolean;
  data: number[];
  error?: string;
}

export class ArrayParser {
  public static parse(rawInput: string | readonly number[]): ArrayParseResult {
    if (Array.isArray(rawInput)) {
      return {
        success: true,
        data: [...rawInput],
      };
    }

    if (typeof rawInput !== "string") {
      return {
        success: false,
        data: [],
        error: "Input must be a string or an array of numbers.",
      };
    }

    const trimmed = rawInput.trim();
    if (trimmed.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Try parsing as JSON first
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "number" && !isNaN(item))
        ) {
          return {
            success: true,
            data: parsed,
          };
        }
      } catch {
        // Fall back to delimiter splitting
      }
    }

    // Delimiter-based splitting (commas, spaces, tabs, newlines)
    const tokens = trimmed
      .replace(/[\[\]]/g, "")
      .split(/[\s,]+/)
      .filter((token) => token.length > 0);

    const numbers: number[] = [];
    for (const token of tokens) {
      const num = Number(token);
      if (isNaN(num) || !isFinite(num)) {
        return {
          success: false,
          data: [],
          error: `Invalid numeric token encountered: "${token}"`,
        };
      }
      numbers.push(num);
    }

    return {
      success: true,
      data: numbers,
    };
  }
}
