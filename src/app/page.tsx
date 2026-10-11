import Link from "next/link";

import { absoluteUrl, canonicalMetadata } from "@/lib/seo";
import { DISCOVERY_CATEGORIES, getDiscoveryContent } from "@/content/discovery";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata = canonicalMetadata("/", {
  title: "Interactive Algorithms & Data Structures Learning Lab",
  description:
    "Learn algorithms and data structures through interactive visualizations, step-by-step explanations, complexity analysis, and practice challenges.",
});

export default function HomePage() {
  const algorithms = getDiscoveryContent("ALGORITHM");
  const dataStructures = getDiscoveryContent("DATA_STRUCTURE");
  const popular = ["bubble-sort", "binary-search", "bfs", "dfs"]
    .map((slug) => algorithms.find((item) => item.metadata.slug === slug))
    .filter(Boolean);
  const popularDataStructure = dataStructures.find(
    (item) => item.metadata.slug === "binary-search-tree"
  );
  const categoryHasAlgorithm = new Set(algorithms.map((item) => item.metadata.category));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LogicLab",
          url: absoluteUrl("/"),
          description: "Interactive algorithm and data-structure learning laboratory.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Interactive laboratory</span>
          <h1>Explore. Visualize. Understand.</h1>
          <p>
            Start with a concept, filter the catalog, and open a focused learning experience built
            from LogicLab&apos;s educational content.
          </p>
        </div>
        <div className="home-header-actions">
          <ButtonLink href="/algorithms">Explore algorithms</ButtonLink>
          <ButtonLink href="/learning" variant="secondary">
            Start learning
          </ButtonLink>
        </div>
      </header>

      <div className="home-discovery-grid">
        <Card>
          <CardHeader
            eyebrow="Catalog"
            title="Algorithms"
            description={`${algorithms.length} initial algorithms across sorting, searching, and graphs.`}
          />
          <div className="home-card-action">
            <Link className="button button--secondary" href="/algorithms">
              Browse algorithms
            </Link>
          </div>
        </Card>
        <Card>
          <CardHeader
            eyebrow="Catalog"
            title="Data Structures"
            description={`${dataStructures.length} initial structures covering arrays, lists, trees, graphs, and more.`}
          />
          <div className="home-card-action">
            <Link className="button button--secondary" href="/data-structures">
              Browse data structures
            </Link>
          </div>
        </Card>
        <Card>
          <CardHeader
            eyebrow="Practice"
            title="Challenges"
            description="Use active practice once you are ready to test your understanding."
          />
          <div className="home-card-action">
            <Link className="button button--secondary" href="/challenges">
              View challenges
            </Link>
          </div>
        </Card>
      </div>

      <section className="home-section">
        <div className="section-heading">
          <span className="page-header__eyebrow">Quick access</span>
          <h2>Explore by category</h2>
        </div>
        <div className="category-grid">
          {DISCOVERY_CATEGORIES.map((category) => (
            <Link
              key={category}
              className="category-card"
              href={`${categoryHasAlgorithm.has(category) ? "/algorithms" : "/data-structures"}?category=${encodeURIComponent(category)}`}
            >
              <strong>{category}</strong>
              <span>Explore related topics →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="page-header__eyebrow">Continue learning</span>
          <h2>Pick up where you left off</h2>
        </div>
        <Card>
          <div className="continue-learning">
            <p>
              Personal continuation will use saved progress once the learning and progress phases
              are active.
            </p>
            <Link className="button button--secondary" href="/progress">
              Open progress
            </Link>
          </div>
        </Card>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="page-header__eyebrow">Popular</span>
          <h2>Good places to start</h2>
        </div>
        <div className="home-popular-grid">
          {[...popular, popularDataStructure].filter(Boolean).map((item) =>
            item ? (
              <Link
                key={item.metadata.slug}
                className="popular-card"
                href={`/${item.metadata.type === "ALGORITHM" ? "algorithms" : "data-structures"}/${item.metadata.slug}`}
              >
                <strong>{item.metadata.title}</strong>
                <span>
                  {item.metadata.category} · {item.metadata.difficulty}
                </span>
              </Link>
            ) : null
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="page-header__eyebrow">Practice</span>
          <h2>Go beyond browsing</h2>
        </div>
        <div className="home-practice">
          <Link className="button button--primary" href="/challenges">
            Start a challenge
          </Link>
          <Link className="button button--secondary" href="/compare">
            Compare algorithms
          </Link>
        </div>
      </section>
    </>
  );
}
