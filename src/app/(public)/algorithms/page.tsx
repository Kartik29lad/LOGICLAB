import { canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CATEGORIES, getDiscoveryContent } from "@/content/discovery";
import type { Difficulty } from "@/content/schema/content-types";
import { DiscoveryExplorer } from "@/features/algorithms/discovery-explorer";

export const metadata = canonicalMetadata("/algorithms", {
  title: "Algorithms — Interactive Learning Catalog",
  description:
    "Explore sorting, searching, and graph algorithms with step-by-step explanations, complexity analysis, and interactive learning experiences.",
});

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
  const items = getDiscoveryContent("ALGORITHM");
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
          <h1>Algorithms</h1>
          <p>Find an algorithm by name, category, or difficulty, then open its learning space.</p>
        </div>
      </header>
      <DiscoveryExplorer
        items={items}
        type="algorithms"
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
