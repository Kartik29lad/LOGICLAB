import { canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CATEGORIES, getDiscoveryContent } from "@/content/discovery";
import type { Difficulty } from "@/content/schema/content-types";
import { DiscoveryExplorer } from "@/features/algorithms/discovery-explorer";

export const metadata = canonicalMetadata("/data-structures", {
  title: "Data Structures — Interactive Learning Catalog",
  description:
    "Learn arrays, stacks, queues, linked lists, trees, heaps, hash tables, tries, and graphs through interactive explanations and visualizations.",
});

export default async function DataStructuresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  };
  const items = getDiscoveryContent("DATA_STRUCTURE");
  const categories = DISCOVERY_CATEGORIES.filter((category) =>
    items.some((item) => item.metadata.category === category)
  );
  const tags = [...new Set(items.flatMap((item) => item.metadata.tags))].sort();
  const requestedDifficulty = value("difficulty");
  const initialDifficulty: Difficulty | "ALL" = ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(
    requestedDifficulty
  )
    ? (requestedDifficulty as Difficulty)
    : "ALL";
  return (
    <>
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Explore</span>
          <h1>Data Structures</h1>
          <p>Browse the structures that organize data and support algorithmic thinking.</p>
        </div>
      </header>
      <DiscoveryExplorer
        items={items}
        type="data-structures"
        categories={categories}
        tags={tags}
        initialQuery={value("q")}
        initialCategory={value("category") || "ALL"}
        initialDifficulty={initialDifficulty}
        initialTag={value("tag") || "ALL"}
      />
    </>
  );
}
