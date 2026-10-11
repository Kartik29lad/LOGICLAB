export interface ExperimentSnapshot {
  title: string;
  algorithmSlugs: string[];
  input: unknown;
  configuration: Record<string, unknown>;
  seed: number;
}

export interface ExperimentRunRecord extends ExperimentSnapshot {
  id: string;
  createdAt: string;
  reproducibilityKey: string;
}

export function createExperimentSnapshot(
  input: Omit<ExperimentSnapshot, "configuration"> & { configuration?: Record<string, unknown> }
): ExperimentSnapshot {
  return {
    ...input,
    algorithmSlugs: [...input.algorithmSlugs],
    configuration: structuredClone(input.configuration ?? {}),
  };
}

export function createReproducibilityKey(snapshot: ExperimentSnapshot): string {
  return [
    snapshot.seed,
    ...snapshot.algorithmSlugs,
    JSON.stringify(snapshot.input),
    JSON.stringify(snapshot.configuration),
  ].join("|");
}

export function createExperimentRunRecord(
  snapshot: ExperimentSnapshot,
  id: string,
  createdAt = new Date().toISOString()
): ExperimentRunRecord {
  return {
    ...createExperimentSnapshot(snapshot),
    id,
    createdAt,
    reproducibilityKey: createReproducibilityKey(snapshot),
  };
}
