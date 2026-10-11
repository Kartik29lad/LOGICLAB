import { executeQuery } from "../../database/connection";

export interface ExperimentRecord {
  experimentId: string;
  userId: string;
  name: string;
  description: string | null;
  experimentType: string;
  inputData: unknown;
  configurationData: unknown;
  randomSeed: number | null;
  executionSettings: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export async function createExperiment(
  userId: string,
  input: {
    name: string;
    description?: string;
    experimentType: string;
    input: unknown;
    configuration?: unknown;
    randomSeed?: number;
    executionSettings?: unknown;
  }
): Promise<ExperimentRecord> {
  const rows = await executeQuery<ExperimentRecord>(
    `INSERT dbo.Experiments(UserId,Name,Description,ExperimentType,InputData,ConfigurationData,RandomSeed,ExecutionSettings,Status)
     OUTPUT INSERTED.ExperimentId,INSERTED.UserId,INSERTED.Name,INSERTED.Description,INSERTED.ExperimentType,INSERTED.InputData,INSERTED.ConfigurationData,INSERTED.RandomSeed,INSERTED.ExecutionSettings,INSERTED.Status,INSERTED.CreatedAt,INSERTED.UpdatedAt
     VALUES(@userId,@name,@description,@experimentType,@inputData,@configurationData,@randomSeed,@executionSettings,'SAVED')`,
    {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      experimentType: input.experimentType,
      inputData: JSON.stringify(input.input),
      configurationData:
        input.configuration === undefined ? null : JSON.stringify(input.configuration),
      randomSeed: input.randomSeed ?? null,
      executionSettings:
        input.executionSettings === undefined ? null : JSON.stringify(input.executionSettings),
    }
  );
  if (!rows[0]) throw new Error("Experiment could not be saved.");
  return normalize(rows[0]);
}

export async function attachExperimentAlgorithms(
  userId: string,
  experimentId: string,
  algorithms: Array<{
    slug: string;
    contentItemId: string;
    contentVersionId: string;
    order: number;
  }>
): Promise<void> {
  const owner = await executeQuery<{ ExperimentId: string }>(
    `SELECT ExperimentId FROM dbo.Experiments WHERE ExperimentId=@experimentId AND UserId=@userId`,
    { experimentId, userId }
  );
  if (!owner[0]) throw new Error("Experiment not found.");
  for (const algorithm of algorithms) {
    await executeQuery(
      `INSERT dbo.ExperimentAlgorithms(ExperimentId,ContentItemId,ContentVersionId,ExecutionOrder) VALUES(@experimentId,@contentItemId,@contentVersionId,@executionOrder)`,
      {
        experimentId,
        contentItemId: algorithm.contentItemId,
        contentVersionId: algorithm.contentVersionId,
        executionOrder: algorithm.order,
      }
    );
  }
}

export async function saveExperimentExecutions(
  userId: string,
  experimentId: string,
  results: Array<{
    algorithmSlug: string;
    input: unknown;
    configuration?: unknown;
    seed?: number;
    result: unknown;
    metrics: unknown;
    durationMs: number;
  }>
): Promise<void> {
  const rows = await executeQuery<{ ExperimentAlgorithmId: string; Slug: string }>(
    `SELECT ea.ExperimentAlgorithmId,ci.Slug FROM dbo.ExperimentAlgorithms ea JOIN dbo.Experiments e ON e.ExperimentId=ea.ExperimentId JOIN dbo.ContentItems ci ON ci.ContentItemId=ea.ContentItemId WHERE e.ExperimentId=@experimentId AND e.UserId=@userId ORDER BY ea.ExecutionOrder`,
    { experimentId, userId }
  );
  for (const result of results) {
    const algorithm = rows.find((row) => row.Slug === result.algorithmSlug);
    if (!algorithm) continue;
    const count = await executeQuery<{ Count: number }>(
      `SELECT COUNT(*) Count FROM dbo.ExperimentExecutions WHERE ExperimentAlgorithmId=@id`,
      { id: algorithm.ExperimentAlgorithmId }
    );
    const executionNumber = Number(count[0]?.Count ?? 0) + 1;
    await executeQuery(
      `INSERT dbo.ExperimentExecutions(ExperimentAlgorithmId,ExecutionNumber,InputSnapshot,ConfigurationSnapshot,RandomSeed,ResultData,MetricsData,ExecutionStatus,ExecutionDurationMs,StartedAt,ExecutedAt) VALUES(@algorithmId,@executionNumber,@input,@configuration,@seed,@result,@metrics,'COMPLETED',@duration,SYSUTCDATETIME(),SYSUTCDATETIME())`,
      {
        algorithmId: algorithm.ExperimentAlgorithmId,
        executionNumber,
        input: JSON.stringify(result.input),
        configuration:
          result.configuration === undefined ? null : JSON.stringify(result.configuration),
        seed: result.seed ?? null,
        result: JSON.stringify(result.result),
        metrics: JSON.stringify(result.metrics),
        duration: Math.max(0, Math.trunc(result.durationMs)),
      }
    );
  }
}

export async function findExperiments(userId: string): Promise<ExperimentRecord[]> {
  const rows = await executeQuery<ExperimentRecord>(
    `SELECT ExperimentId,UserId,Name,Description,ExperimentType,InputData,ConfigurationData,RandomSeed,ExecutionSettings,Status,CreatedAt,UpdatedAt FROM dbo.Experiments WHERE UserId=@userId AND Status<>'ARCHIVED' ORDER BY UpdatedAt DESC`,
    { userId }
  );
  return rows.map(normalize);
}

export async function findExperiment(userId: string, experimentId: string) {
  const rows = await executeQuery<ExperimentRecord>(
    `SELECT ExperimentId,UserId,Name,Description,ExperimentType,InputData,ConfigurationData,RandomSeed,ExecutionSettings,Status,CreatedAt,UpdatedAt FROM dbo.Experiments WHERE UserId=@userId AND ExperimentId=@experimentId`,
    { userId, experimentId }
  );
  return rows[0] ? normalize(rows[0]) : null;
}

function normalize(row: ExperimentRecord): ExperimentRecord {
  return {
    ...row,
    inputData: parseJson(row.inputData),
    configurationData: parseJson(row.configurationData),
    executionSettings: parseJson(row.executionSettings),
  };
}

export async function saveExperimentBundle(
  userId: string,
  input: {
    name: string;
    description?: string;
    input: unknown;
    configuration?: unknown;
    randomSeed?: number;
    algorithms: Array<{
      slug: string;
      contentItemId: string;
      contentVersionId: string;
      order: number;
    }>;
    results: Array<{
      algorithmSlug: string;
      input: unknown;
      configuration?: unknown;
      seed?: number;
      result: unknown;
      metrics: unknown;
      durationMs: number;
    }>;
  }
): Promise<ExperimentRecord> {
  const { withTransaction } = await import("../../database/connection");
  return withTransaction(async (transaction) => {
    const created = await transaction
      .request()
      .input("userId", userId)
      .input("name", input.name.trim())
      .input("description", input.description?.trim() || null)
      .input("inputData", JSON.stringify(input.input))
      .input(
        "configurationData",
        input.configuration === undefined ? null : JSON.stringify(input.configuration)
      )
      .input("randomSeed", input.randomSeed ?? null)
      .input("executionSettings", JSON.stringify({ algorithmCount: input.algorithms.length }))
      .query<ExperimentRecord>(
        `INSERT dbo.Experiments(UserId,Name,Description,ExperimentType,InputData,ConfigurationData,RandomSeed,ExecutionSettings,Status) OUTPUT INSERTED.ExperimentId AS experimentId,INSERTED.UserId AS userId,INSERTED.Name AS name,INSERTED.Description AS description,INSERTED.ExperimentType AS experimentType,INSERTED.InputData AS inputData,INSERTED.ConfigurationData AS configurationData,INSERTED.RandomSeed AS randomSeed,INSERTED.ExecutionSettings AS executionSettings,INSERTED.Status AS status,INSERTED.CreatedAt AS createdAt,INSERTED.UpdatedAt AS updatedAt VALUES(@userId,@name,@description,'COMPARISON',@inputData,@configurationData,@randomSeed,@executionSettings,'SAVED')`
      );
    const experiment = created.recordset[0];
    if (!experiment) throw new Error("Experiment could not be saved.");
    const algorithmRows: Array<{ id: string; slug: string }> = [];
    for (const algorithm of input.algorithms) {
      const inserted = await transaction
        .request()
        .input("experimentId", experiment.experimentId)
        .input("contentItemId", algorithm.contentItemId)
        .input("contentVersionId", algorithm.contentVersionId)
        .input("executionOrder", algorithm.order)
        .query<{ id: string }>(
          `INSERT dbo.ExperimentAlgorithms(ExperimentId,ContentItemId,ContentVersionId,ExecutionOrder) OUTPUT INSERTED.ExperimentAlgorithmId AS id VALUES(@experimentId,@contentItemId,@contentVersionId,@executionOrder)`
        );
      algorithmRows.push({ id: inserted.recordset[0]!.id, slug: algorithm.slug });
    }
    for (const result of input.results) {
      const algorithm = algorithmRows.find((row) => row.slug === result.algorithmSlug);
      if (!algorithm)
        throw new Error(`Experiment algorithm result is not configured: ${result.algorithmSlug}`);
      await transaction
        .request()
        .input("algorithmId", algorithm.id)
        .input("input", JSON.stringify(result.input))
        .input(
          "configuration",
          result.configuration === undefined ? null : JSON.stringify(result.configuration)
        )
        .input("seed", result.seed ?? null)
        .input("result", JSON.stringify(result.result))
        .input("metrics", JSON.stringify(result.metrics))
        .input("duration", Math.max(0, Math.trunc(result.durationMs)))
        .query(
          `INSERT dbo.ExperimentExecutions(ExperimentAlgorithmId,ExecutionNumber,InputSnapshot,ConfigurationSnapshot,RandomSeed,ResultData,MetricsData,ExecutionStatus,ExecutionDurationMs,StartedAt,ExecutedAt) VALUES(@algorithmId,1,@input,@configuration,@seed,@result,@metrics,'COMPLETED',@duration,SYSUTCDATETIME(),SYSUTCDATETIME())`
        );
    }
    return normalize(experiment);
  });
}
