import type { Metadata } from "next";

import type { ChallengeDefinition } from "@/core/challenges";
import { canonicalMetadata } from "@/lib/seo";
import { CHALLENGE_DEFINITIONS } from "@/content/challenges";
import { DISCOVERY_CONTENT } from "@/content/discovery";
import type { ContentPackage } from "@/content/schema/content-types";
import { GlobalSearch, type GlobalSearchRecord } from "@/features/search/global-search";

export const metadata: Metadata = canonicalMetadata("/search", {
  title: "Global Search — Find Algorithms, Visualizers & Practice | LogicLab",
  description:
    "Search LogicLab algorithms, data structures, interactive visualizers, learning paths, and practice challenges.",
  noIndex: true,
});

function topicHref(item: ContentPackage): string {
  if (item.metadata.type === "ALGORITHM") return `/algorithms/${item.metadata.slug}`;
  if (item.metadata.type === "DATA_STRUCTURE") return `/data-structures/${item.metadata.slug}`;
  if (item.metadata.type === "LEARNING_PATH") return `/learning-paths/${item.metadata.slug}`;
  return "/search";
}

function topicSearchDescription(item: ContentPackage): string {
  if (item.metadata.slug === "binary-search") {
    return "A fast search algorithm that works on sorted data by repeatedly dividing the search space in half.";
  }
  return item.metadata.summary;
}

function conceptualSearchTags(item: ContentPackage): string[] {
  const explanation = [
    item.metadata.summary,
    item.metadata.description,
    item.metadata.mainIdea,
    item.metadata.whyItWorks,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /divide[- ]and[- ]conquer|repeatedly halves|halves the search space/.test(explanation)
    ? ["Divide and Conquer"]
    : [];
}

function searchCategory(item: ContentPackage): GlobalSearchRecord["categoryFilter"] {
  if (item.metadata.type === "ALGORITHM") return "Algorithms";
  if (item.metadata.type === "DATA_STRUCTURE") return "Data Structures";

  const taxonomy = [item.metadata.category, ...item.metadata.tags].join(" ").toLowerCase();
  if (/cyber|security|cryptograph|vulnerabil/.test(taxonomy)) return "Cybersecurity";
  if (/network|tcp|udp|protocol|routing/.test(taxonomy)) return "Networking";
  if (/program|coding|language|compiler/.test(taxonomy)) return "Programming";
  return undefined;
}

function buildSearchRecords(): GlobalSearchRecord[] {
  const activeContent = DISCOVERY_CONTENT.filter((item) => item.metadata.isActive);
  const topics: GlobalSearchRecord[] = activeContent.map((item) => {
    const kind = item.metadata.type === "LEARNING_PATH" ? "LEARNING_PATH" : "TOPIC";
    const group =
      item.metadata.type === "ALGORITHM"
        ? "Algorithms"
        : item.metadata.type === "DATA_STRUCTURE"
          ? "Data Structures"
          : "Learning Paths";
    return {
      id: `topic-${item.metadata.slug}`,
      kind,
      title: item.metadata.title,
      description: topicSearchDescription(item),
      href: topicHref(item),
      group,
      categoryFilter: searchCategory(item),
      category: item.metadata.category,
      difficulty: item.metadata.difficulty,
      tags: [
        item.metadata.type === "ALGORITHM" ? "Algorithm" : group.slice(0, -1),
        ...item.metadata.tags,
        ...conceptualSearchTags(item),
      ],
      searchableText: [
        item.metadata.title,
        item.metadata.summary,
        item.metadata.description,
        item.metadata.category,
        item.metadata.tags.join(" "),
        item.metadata.prerequisites.join(" "),
        (item.concepts ?? []).join(" "),
        (item.metadata.useCases ?? []).join(" "),
        (item.metadata.properties ?? []).join(" "),
        item.metadata.complexity?.timeAverage ?? "",
        item.metadata.complexity?.space ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  const visualizers: GlobalSearchRecord[] = activeContent
    .filter(
      (item) =>
        (item.metadata.type === "ALGORITHM" || item.metadata.type === "DATA_STRUCTURE") &&
        Boolean(item.metadata.visualizationType)
    )
    .map((item) => ({
      id: `visualizer-${item.metadata.slug}`,
      kind: "VISUALIZER",
      title: `${item.metadata.title} Visualizer`,
      description: `Interactive visualization to understand how ${item.metadata.title} works step by step.`,
      href: `/visualizer/${item.metadata.slug}`,
      group: item.metadata.type === "ALGORITHM" ? "Algorithms" : "Data Structures",
      categoryFilter: searchCategory(item),
      category: item.metadata.category,
      difficulty: item.metadata.difficulty,
      tags: ["Visualizer", item.metadata.type === "ALGORITHM" ? "Algorithm" : "Data Structure"],
      searchableText: [
        item.metadata.title,
        item.metadata.summary,
        item.metadata.category,
        item.metadata.tags.join(" "),
        "visualizer visualization interactive execution",
      ]
        .join(" ")
        .toLowerCase(),
    }));

  const challenges: GlobalSearchRecord[] = (
    CHALLENGE_DEFINITIONS as readonly ChallengeDefinition[]
  ).map((challenge) => {
    const related = activeContent.find((item) => item.metadata.slug === challenge.algorithmSlug);
    return {
      id: `practice-${challenge.id}`,
      kind: "PRACTICE",
      title: related ? `${related.metadata.title} – Practice Problems` : challenge.title,
      description: related
        ? "Solve hand-picked problems to strengthen your understanding."
        : challenge.description,
      href: `/challenges/${challenge.id}`,
      group: "Practice",
      categoryFilter: related ? searchCategory(related) : undefined,
      category: related?.metadata.category ?? "Practice",
      difficulty: challenge.difficulty,
      tags: ["Practice", ...(related?.metadata.category ? [related.metadata.category] : [])],
      searchableText: [
        challenge.title,
        challenge.description,
        challenge.prompt,
        challenge.explanation,
        challenge.algorithmSlug,
        related?.metadata.title ?? "",
        related?.metadata.category ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  return [...topics, ...visualizers, ...challenges];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawQuery = params.q;
  const initialQuery =
    ((Array.isArray(rawQuery) ? rawQuery[0] : rawQuery) ?? "binary search").trim() ||
    "binary search";

  return <GlobalSearch records={buildSearchRecords()} initialQuery={initialQuery} />;
}
