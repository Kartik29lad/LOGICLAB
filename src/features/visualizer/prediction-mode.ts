import type {
  CanonicalExecutionTrace,
  ExecutionEventType,
  ExecutionTraceStep,
} from "@/contracts/events/trace-events";

export interface PredictionOption {
  id: string;
  label: string;
  type: ExecutionEventType;
}

export interface PredictionChallenge {
  stepIndex: number;
  currentEvent: ExecutionTraceStep["event"];
  options: PredictionOption[];
  actual: PredictionOption;
  explanation: string;
}

const COMMON_EVENTS: ExecutionEventType[] = [
  "COMPARE",
  "SWAP",
  "WRITE",
  "VISIT",
  "RELAX",
  "INSERT",
  "REMOVE",
  "ENQUEUE",
  "DEQUEUE",
  "PUSH",
  "POP",
  "FOUND",
  "BACKTRACK",
  "COMPLETE",
];

function labelFor(type: ExecutionEventType): string {
  return type
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function chooseDistractors(
  actual: ExecutionEventType,
  previous?: ExecutionEventType
): ExecutionEventType[] {
  const family =
    actual === "SWAP"
      ? ["COMPARE", "WRITE", "MARK_SORTED"]
      : actual === "RELAX"
        ? ["VISIT", "SET_CURRENT", "FOUND"]
        : actual === "VISIT"
          ? ["VISIT", "ENQUEUE", "DEQUEUE"]
          : actual === "ENQUEUE"
            ? ["DEQUEUE", "VISIT", "PUSH"]
            : actual === "DEQUEUE"
              ? ["ENQUEUE", "VISIT", "PUSH"]
              : actual === "PUSH"
                ? ["POP", "VISIT", "ENQUEUE"]
                : actual === "POP"
                  ? ["PUSH", "BACKTRACK", "VISIT"]
                  : ["COMPARE", "VISIT", "WRITE"];
  const candidates = [...family, ...COMMON_EVENTS].filter(
    (type, index, all) => type !== actual && all.indexOf(type) === index && type !== previous
  );
  return candidates.slice(0, 3) as ExecutionEventType[];
}

export function createPredictionChallenge<TInput, TOutput, TState>(
  trace: CanonicalExecutionTrace<TInput, TOutput, TState>,
  stepIndex: number
): PredictionChallenge | null {
  const next = trace.steps[stepIndex + 1];
  if (!next) return null;
  const previous = trace.steps[stepIndex]?.event.type;
  const actual = next.event.type;
  const types = [actual, ...chooseDistractors(actual, previous)];
  const options = types.map((type, index) => ({
    id: `${stepIndex}-${type}-${index}`,
    label: labelFor(type),
    type,
  }));
  return {
    stepIndex,
    currentEvent: trace.steps[stepIndex]?.event ?? trace.steps[0].event,
    options,
    actual: options[0],
    explanation: next.event.description ?? `The next execution event is ${labelFor(actual)}.`,
  };
}

export function evaluatePrediction(
  challenge: PredictionChallenge,
  optionId: string
): { correct: boolean; actual: PredictionOption; explanation: string } {
  const selected = challenge.options.find((option) => option.id === optionId);
  return {
    correct: selected?.type === challenge.actual.type,
    actual: challenge.actual,
    explanation: challenge.explanation,
  };
}
