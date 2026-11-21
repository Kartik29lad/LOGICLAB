import type { CodeChallenge } from "./code-challenges";

export interface CodeTestResult {
  id: string;
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  durationMs: number;
  error?: string;
}

export interface CodeRunResult {
  passed: number;
  total: number;
  durationMs: number;
  tests: CodeTestResult[];
}

interface RunnerMessage {
  requestId: string;
  ok: boolean;
  durationMs?: number;
  tests?: CodeTestResult[];
  error?: string;
}

const RUNNER_URL = "/api/challenges/runner-worker";
const DEFAULT_TIMEOUT_MS = 2_000;
const MAX_SOURCE_LENGTH = 20_000;

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function runCodeChallenge(
  challenge: CodeChallenge,
  source: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<CodeRunResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    throw new Error("Your browser does not support the isolated code runner.");
  }
  if (!source.trim()) throw new Error("Add your solution before running tests.");
  if (source.length > MAX_SOURCE_LENGTH) {
    throw new Error(
      `Your solution is too long. Keep it under ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`
    );
  }

  const requestId = createRequestId();
  const worker = new Worker(RUNNER_URL, { name: "logiclab-challenge-runner", type: "classic" });

  return new Promise<CodeRunResult>((resolve, reject) => {
    const startedAt = performance.now();
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      worker.terminate();
      callback();
    };

    const timeoutId = window.setTimeout(() => {
      finish(() =>
        reject(new Error(`Time limit exceeded (${timeoutMs} ms). Check for an infinite loop.`))
      );
    }, timeoutMs);

    worker.addEventListener("message", (event: MessageEvent<RunnerMessage>) => {
      const message = event.data;
      if (!message || message.requestId !== requestId) return;
      finish(() => {
        if (!message.ok || !message.tests) {
          reject(new Error(message.error || "The code runner could not execute this solution."));
          return;
        }
        const tests = message.tests;
        resolve({
          passed: tests.filter((test) => test.passed).length,
          total: tests.length,
          durationMs: message.durationMs ?? Math.round(performance.now() - startedAt),
          tests,
        });
      });
    });

    worker.addEventListener("error", (event) => {
      event.preventDefault();
      finish(() => reject(new Error("The isolated code runner stopped unexpectedly.")));
    });

    worker.postMessage({
      requestId,
      source,
      functionName: challenge.functionName,
      tests: challenge.testCases,
    });
  });
}
