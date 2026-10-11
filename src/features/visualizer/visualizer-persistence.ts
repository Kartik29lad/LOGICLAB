import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";

export interface VisualizerPersistencePayload {
  title: string;
  description: string;
  algorithmSlugs: string[];
  input: unknown;
  configuration: Record<string, unknown>;
  seed: number;
}

export interface VisualizerPersistenceResult {
  experimentId: string;
  reproducible: boolean;
}

function stableSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash | 0) || 1;
}

export function buildVisualizerPersistencePayload(
  trace: CanonicalExecutionTrace<unknown, unknown, unknown>,
  title: string,
  configuration: Record<string, unknown> = {}
): VisualizerPersistencePayload {
  return {
    title: `${title} visualizer run`,
    description: `Saved interactive execution for ${title}.`,
    algorithmSlugs: [trace.algorithmSlug],
    input: trace.input,
    configuration: { ...configuration, executionId: trace.executionId },
    seed: stableSeed(trace.executionId),
  };
}

export async function persistVisualizerRun(
  payload: VisualizerPersistencePayload,
  idempotencyKey: string
): Promise<VisualizerPersistenceResult> {
  const response = await fetch("/api/experiments", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = new Error(
      response.status === 401
        ? "Sign in to save visualizer runs."
        : "This visualizer run could not be saved."
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  const body = (await response.json()) as { experimentId?: string; reproducible?: boolean };
  if (!body.experimentId) throw new Error("The saved experiment did not return an experiment id.");
  return { experimentId: body.experimentId, reproducible: body.reproducible !== false };
}
