import { canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CONTENT } from "@/content/discovery";
import type { Difficulty } from "@/content/schema/content-types";
import { ExploreLibrary } from "@/features/algorithms/explore-library";

export const metadata = canonicalMetadata("/algorithms", {
  title: "Explore Library — Algorithms & Data Structures",
  description:
    "Discover algorithms and data structures by topic, difficulty, and category, then open their explanations and interactive visualizations.",
});

const DIFFICULTIES: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const CATEGORY_ALIASES: Record<string, string> = {
  sorting: "Sorting",
  searching: "Searching",
  graphs: "Graphs",
  graph: "Graphs",
  trees: "Trees",
  "data-structures": "Others",
  "data structures": "Others",
  others: "Others",
};

export default async function AlgorithmsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  };

  const items = DISCOVERY_CONTENT.filter(
    (item) =>
      item.metadata.isActive &&
      (item.metadata.type === "ALGORITHM" || item.metadata.type === "DATA_STRUCTURE")
  );
  const requestedDifficulty = value("difficulty").toUpperCase();
  const initialDifficulty: Difficulty | "ALL" = DIFFICULTIES.includes(
    requestedDifficulty as Difficulty
  )
    ? (requestedDifficulty as Difficulty)
    : "ALL";
  const rawCategory = value("category").toLowerCase();

  return (
    <ExploreLibrary
      items={items}
      initialQuery={value("q")}
      initialCategory={CATEGORY_ALIASES[rawCategory] ?? "ALL"}
      initialDifficulty={initialDifficulty}
    />
  );
}
