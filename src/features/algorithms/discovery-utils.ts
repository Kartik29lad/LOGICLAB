import type { ContentPackage, Difficulty } from "@/content/schema/content-types";

export interface DiscoveryFilters {
  query: string;
  category: string;
  difficulty: Difficulty | "ALL";
  tag: string;
}

export function filterDiscovery(
  items: readonly ContentPackage[],
  filters: DiscoveryFilters
): ContentPackage[] {
  const query = filters.query.trim().toLowerCase();
  return items
    .filter((item) => filters.category === "ALL" || item.metadata.category === filters.category)
    .filter(
      (item) => filters.difficulty === "ALL" || item.metadata.difficulty === filters.difficulty
    )
    .filter((item) => filters.tag === "ALL" || item.metadata.tags.includes(filters.tag))
    .filter((item) => {
      if (!query) return true;
      const haystack = [
        item.metadata.title,
        item.metadata.summary,
        item.metadata.description,
        item.metadata.category,
        ...item.metadata.tags,
        ...item.metadata.prerequisites,
        ...(item.concepts ?? []),
        ...(item.metadata.useCases ?? []),
        ...(item.metadata.properties ?? []),
        ...(item.metadata.formulas ?? []),
        item.metadata.complexity?.timeBest ?? "",
        item.metadata.complexity?.timeAverage ?? "",
        item.metadata.complexity?.timeWorst ?? "",
        item.metadata.complexity?.space ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
}
