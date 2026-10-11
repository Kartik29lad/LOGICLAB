import Link from "next/link";

import { canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CONTENT } from "@/content/discovery";
import { SearchIcon } from "@/components/navigation/icons";
import { Card } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/status";
import { filterDiscovery } from "@/features/algorithms/discovery-utils";

export const metadata = canonicalMetadata("/search", {
  title: "Search LogicLab",
  description: "Search LogicLab learning content.",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const results = query.trim()
    ? filterDiscovery(DISCOVERY_CONTENT, {
        query,
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      })
    : [];

  return (
    <div className="search-page">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Global search</span>
          <h1>Search LogicLab</h1>
          <p>
            Search names, categories, tags, concepts, prerequisites, and complexity across the
            initial catalog.
          </p>
        </div>
      </header>

      <form className="search-page-form" method="GET" action="/search" role="search">
        <label htmlFor="search-page-input" className="sr-only">
          Search query
        </label>
        <div className="search-page-input-wrapper">
          <SearchIcon className="search-page-icon" aria-hidden="true" />
          <input
            id="search-page-input"
            name="q"
            defaultValue={query}
            placeholder="Search algorithms, data structures, complexity..."
            type="search"
            className="input search-page-input"
          />
          <button type="submit" className="button button--primary button--sm">
            Search
          </button>
        </div>
      </form>

      {!query.trim() ? (
        <EmptyState
          title="Start searching"
          description="Enter an algorithm, data structure, topic, tag, concept, or complexity such as O(n²)."
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No results"
          description={`Nothing matched “${query}”. Try a broader concept, category, or tag.`}
        />
      ) : (
        <div className="search-results">
          <p className="discovery-result-count">
            Showing {results.length} result{results.length === 1 ? "" : "s"} for “{query}”.
          </p>
          {results.map((item) => {
            const topicHref = `/${item.metadata.type === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.metadata.slug}`;
            const visualizerHref = item.metadata.visualizationType
              ? `/visualizer/${item.metadata.slug}`
              : undefined;

            return (
              <Card key={item.metadata.slug} className="search-result-card">
                <div className="search-result-card__body">
                  <div className="discovery-card__badges">
                    <Badge tone="info">
                      {item.metadata.type === "ALGORITHM" ? "Algorithm" : "Data Structure"}
                    </Badge>
                    <Badge tone="neutral">{item.metadata.category}</Badge>
                    <Badge
                      tone={
                        item.metadata.difficulty === "BEGINNER"
                          ? "success"
                          : item.metadata.difficulty === "INTERMEDIATE"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {item.metadata.difficulty}
                    </Badge>
                  </div>
                  <h2>{item.metadata.title}</h2>
                  <p>{item.metadata.summary}</p>
                  <div className="discovery-card__actions">
                    <Link className="button button--secondary button--sm" href={topicHref}>
                      Learn
                    </Link>
                    {visualizerHref ? (
                      <Link className="button button--primary button--sm" href={visualizerHref}>
                        Visualize
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
