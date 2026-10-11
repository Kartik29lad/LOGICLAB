import { executeQuery } from "../../database/connection";

export async function createComparison(
  userId: string,
  input: {
    name?: string;
    input: unknown;
    configuration?: unknown;
    algorithms: Array<{
      contentItemId: string;
      contentVersionId: string;
      order: number;
      result: unknown;
      metrics: unknown;
      durationMs: number;
    }>;
  }
) {
  const rows = await executeQuery<{ ComparisonId: string }>(
    `INSERT dbo.Comparisons(UserId,Name,InputData,ConfigurationData) OUTPUT INSERTED.ComparisonId VALUES(@userId,@name,@input,@configuration)`,
    {
      userId,
      name: input.name?.trim() || null,
      input: JSON.stringify(input.input),
      configuration: input.configuration === undefined ? null : JSON.stringify(input.configuration),
    }
  );
  const comparisonId = rows[0]?.ComparisonId;
  if (!comparisonId) throw new Error("Comparison could not be saved.");
  for (const algorithm of input.algorithms) {
    await executeQuery(
      `INSERT dbo.ComparisonAlgorithms(ComparisonId,ContentItemId,ContentVersionId,ExecutionOrder,MetricsData,ResultData,ExecutionDurationMs) VALUES(@comparisonId,@contentItemId,@contentVersionId,@order,@metrics,@result,@duration)`,
      {
        comparisonId,
        contentItemId: algorithm.contentItemId,
        contentVersionId: algorithm.contentVersionId,
        order: algorithm.order,
        metrics: JSON.stringify(algorithm.metrics),
        result: JSON.stringify(algorithm.result),
        duration: Math.max(0, Math.trunc(algorithm.durationMs)),
      }
    );
  }
  return comparisonId;
}

export async function getComparison(userId: string, comparisonId: string) {
  const comparisons = await executeQuery(
    `SELECT ComparisonId,Name,InputData,ConfigurationData,CreatedAt,UpdatedAt FROM dbo.Comparisons WHERE ComparisonId=@comparisonId AND UserId=@userId`,
    { comparisonId, userId }
  );
  if (!comparisons[0]) return null;
  const algorithms = await executeQuery(
    `SELECT ca.ExecutionOrder,ci.Slug,ci.DisplayName,ca.MetricsData,ca.ResultData,ca.ExecutionDurationMs FROM dbo.ComparisonAlgorithms ca JOIN dbo.ContentItems ci ON ci.ContentItemId=ca.ContentItemId WHERE ca.ComparisonId=@comparisonId ORDER BY ca.ExecutionOrder`,
    { comparisonId }
  );
  return {
    ...comparisons[0],
    inputData: parseJson(comparisons[0].InputData),
    configurationData: parseJson(comparisons[0].ConfigurationData),
    algorithms: algorithms.map((a) => ({
      ...a,
      metrics: parseJson(a.MetricsData),
      result: parseJson(a.ResultData),
    })),
  };
}

function parseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
