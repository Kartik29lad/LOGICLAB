import type { ExperimentDefinition } from "@/core/experiments";

import {
  findExperiment,
  findExperiments,
  saveExperimentBundle,
} from "../../repositories/experiments/experiment-repository";
import { runComparison } from "./execution-service";

export async function executeAndSaveExperiment(userId: string, definition: ExperimentDefinition) {
  validateDefinition(definition);
  const results = runComparison(definition.algorithmSlugs, definition.input);
  const content = await resolveAlgorithms(definition.algorithmSlugs);
  const experiment = await saveExperimentBundle(userId, {
    name: definition.title,
    description: definition.description,
    input: definition.input,
    configuration: definition.configuration,
    randomSeed: definition.seed,
    algorithms: content,
    results: results.map((result) => ({
      algorithmSlug: result.slug,
      input: definition.input,
      configuration: definition.configuration,
      seed: definition.seed,
      result: result.result,
      metrics: result.metrics,
      durationMs: result.metrics.durationMs,
    })),
  });
  return { experiment, results, reproducible: definition.seed !== undefined };
}

export async function executeComparison(
  userId: string,
  input: {
    name?: string;
    algorithmSlugs: string[];
    input: unknown;
    configuration?: Record<string, unknown>;
  }
) {
  const results = runComparison(input.algorithmSlugs, input.input);
  const content = await resolveAlgorithms(input.algorithmSlugs);
  const comparisonId = await (
    await import("../../repositories/experiments/comparison-repository")
  ).createComparison(userId, {
    name: input.name,
    input: input.input,
    configuration: input.configuration,
    algorithms: results.map((result, index) => ({
      contentItemId: content[index]!.contentItemId,
      contentVersionId: content[index]!.contentVersionId,
      order: index + 1,
      result: result.result,
      metrics: result.metrics,
      durationMs: result.metrics.durationMs,
    })),
  });
  return { comparisonId, results };
}

export { findExperiment, findExperiments };

async function resolveAlgorithms(slugs: string[]) {
  const { executeQuery } = await import("../../database/connection");
  const result = [] as Array<{
    slug: string;
    contentItemId: string;
    contentVersionId: string;
    order: number;
  }>;
  for (const [index, slug] of slugs.entries()) {
    const rows = await executeQuery<{ ContentItemId: string; ContentVersionId: string }>(
      `SELECT TOP 1 ci.ContentItemId,cv.ContentVersionId FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.Slug=@slug AND ci.ContentType='ALGORITHM' AND ci.IsActive=1`,
      { slug }
    );
    if (!rows[0]) throw new Error(`Algorithm content not found: ${slug}`);
    result.push({
      slug,
      contentItemId: rows[0].ContentItemId,
      contentVersionId: rows[0].ContentVersionId,
      order: index + 1,
    });
  }
  return result;
}

function validateDefinition(definition: ExperimentDefinition) {
  if (!definition.title.trim() || definition.title.length > 200)
    throw new Error("Experiment title is required and must be 200 characters or fewer.");
  if (new Set(definition.algorithmSlugs).size !== definition.algorithmSlugs.length)
    throw new Error("Algorithms cannot be duplicated.");
  if (definition.algorithmSlugs.length < 2 || definition.algorithmSlugs.length > 6)
    throw new Error("Select between 2 and 6 algorithms.");
}
