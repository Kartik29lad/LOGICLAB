import type { ContentPackage, ContentRegistryReferenceProvider } from "../schema/content-types";
import { validateContentPackage } from "../schema/content-validator";

export interface RegistryValidationResult {
  valid: boolean;
  issues: Array<{ slug: string; path: string; message: string }>;
}

export function validateRegistry(
  content: ContentPackage[],
  references: ContentRegistryReferenceProvider
): RegistryValidationResult {
  const issues: RegistryValidationResult["issues"] = [];
  const seenSlugs = new Set<string>();
  const seenIds = new Set<string>();
  const availableSlugs = new Set(content.map((item) => item.metadata.slug));
  for (const item of content) {
    if (seenSlugs.has(item.metadata.slug))
      issues.push({ slug: item.metadata.slug, path: "metadata.slug", message: "duplicate slug" });
    if (seenIds.has(item.metadata.id))
      issues.push({ slug: item.metadata.slug, path: "metadata.id", message: "duplicate id" });
    seenSlugs.add(item.metadata.slug);
    seenIds.add(item.metadata.id);
    for (const problem of validateContentPackage(item, references))
      issues.push({ slug: item.metadata.slug, ...problem });
    for (const relation of item.metadata.relatedContent) {
      if (!availableSlugs.has(relation.slug))
        issues.push({
          slug: item.metadata.slug,
          path: `metadata.relatedContent.${relation.slug}`,
          message: "referenced content slug does not exist",
        });
    }
    for (const prerequisite of item.metadata.prerequisites) {
      if (!availableSlugs.has(prerequisite))
        issues.push({
          slug: item.metadata.slug,
          path: `metadata.prerequisites.${prerequisite}`,
          message: "prerequisite slug does not exist",
        });
    }
  }
  return { valid: issues.length === 0, issues };
}
