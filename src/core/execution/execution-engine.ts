import type { AlgorithmTrace } from "../../contracts/events/trace-events";
import { buildBinarySearchSteps } from "../algorithms/implementations/searching/binary-search/binary-search.steps";
import { buildLinearSearchSteps } from "../algorithms/implementations/searching/linear-search/linear-search.steps";
import { buildBubbleSortSteps } from "../algorithms/implementations/sorting/bubble-sort/bubble-sort.steps";
import { buildInsertionSortSteps } from "../algorithms/implementations/sorting/insertion-sort/insertion-sort.steps";
import { buildSelectionSortSteps } from "../algorithms/implementations/sorting/selection-sort/selection-sort.steps";
import { ArrayParser } from "../input/parsers/array-parser";
import { ArrayValidator } from "../input/validators/array-validator";
import { ExecutionContext } from "./execution-context";
import { ExecutionController } from "./execution-controller";
import type { ExecutionLimits } from "./execution-limits";

export interface ExecuteAlgorithmOptions {
  limits?: Partial<ExecutionLimits>;
  target?: number; // for search algorithms
}

/**
 * Execution Engine executing algorithms into controlled, bounded traces.
 */
export class ExecutionEngine {
  public static execute(
    algorithmSlug: string,
    rawInput: string | readonly number[],
    options?: ExecuteAlgorithmOptions
  ): ExecutionController {
    // 1. Input Normalization & Validation
    const parseResult = ArrayParser.parse(rawInput);
    if (!parseResult.success) {
      throw new Error(`Input parsing failed: ${parseResult.error}`);
    }

    const validationResult = ArrayValidator.validate(parseResult.data);
    if (!validationResult.isValid) {
      throw new Error(`Input validation failed: ${validationResult.error}`);
    }

    const inputData = parseResult.data;
    const context = new ExecutionContext({ limits: options?.limits });

    let trace: AlgorithmTrace;

    switch (algorithmSlug) {
      case "bubble-sort":
        trace = buildBubbleSortSteps(inputData, context);
        break;

      case "selection-sort":
        trace = buildSelectionSortSteps(inputData, context);
        break;

      case "insertion-sort":
        trace = buildInsertionSortSteps(inputData, context);
        break;

      case "linear-search":
        trace = buildLinearSearchSteps(inputData, options?.target ?? inputData[0] ?? 0, context);
        break;

      case "binary-search": {
        // Ensure array is sorted for binary search
        const sorted = [...inputData].sort((a, b) => a - b);
        trace = buildBinarySearchSteps(sorted, options?.target ?? sorted[0] ?? 0, context);
        break;
      }

      default:
        throw new Error(`Unsupported algorithm execution slug: "${algorithmSlug}".`);
    }

    return new ExecutionController(trace);
  }
}
