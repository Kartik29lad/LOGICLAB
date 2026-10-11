import { DISCOVERY_CONTENT } from "../../content/discovery";
import type { ContentPackage } from "../../content/schema/content-types";

export interface LearningPathDefinition {
  slug: string;
  title: string;
  description: string;
  difficulty: ContentPackage["metadata"]["difficulty"];
  itemSlugs: readonly string[];
  prerequisitePathSlugs: readonly string[];
}

export const LEARNING_PATHS: readonly LearningPathDefinition[] = DISCOVERY_CONTENT.filter(
  (item) => item.metadata.type === "LEARNING_PATH"
)
  .sort((a, b) => (a.learningPath?.order ?? 0) - (b.learningPath?.order ?? 0))
  .map((item) => ({
    slug: item.metadata.slug,
    title: item.metadata.title,
    description: item.metadata.description,
    difficulty: item.metadata.difficulty,
    itemSlugs: item.learningPath?.itemSlugs ?? [],
    prerequisitePathSlugs: item.metadata.prerequisites,
  }));

export function getLearningPath(slug: string): LearningPathDefinition | undefined {
  return LEARNING_PATHS.find((path) => path.slug === slug);
}

export function getLearningPathItemSet(slug: string): ReadonlySet<string> {
  return new Set(getLearningPath(slug)?.itemSlugs ?? []);
}
