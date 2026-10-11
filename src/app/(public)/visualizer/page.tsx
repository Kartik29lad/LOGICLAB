import Link from "next/link";

import { getDiscoveryContent } from "@/content/discovery";

export default function Page() {
  const algorithms = getDiscoveryContent("ALGORITHM").filter((item) =>
    Boolean(item.metadata.visualizationType)
  );
  const structures = getDiscoveryContent("DATA_STRUCTURE").filter((item) =>
    Boolean(item.metadata.visualizationType)
  );
  return (
    <div className="visualizer-route">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">LogicLab Laboratory</span>
          <h1>Interactive Visualizer</h1>
          <p>
            Choose a laboratory and watch the canonical execution trace become a live visual
            explanation.
          </p>
        </div>
      </header>
      <section className="visualizer-landing-section" aria-labelledby="visualizer-algorithms">
        <h2 id="visualizer-algorithms">Algorithms</h2>
        <div className="visualizer-landing-grid">
          {algorithms.map((item) => (
            <Link
              className="visualizer-landing-card"
              href={`/visualizer/${item.metadata.slug}`}
              key={item.metadata.slug}
            >
              <span className="visualizer-landing-card__meta">
                Algorithm · {item.metadata.category}
              </span>
              <h2>{item.metadata.title}</h2>
              <p>Step through execution, inspect operations, and explore complexity.</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="visualizer-landing-section" aria-labelledby="visualizer-structures">
        <h2 id="visualizer-structures">Data Structures</h2>
        <div className="visualizer-landing-grid">
          {structures.map((item) => (
            <Link
              className="visualizer-landing-card"
              href={`/visualizer/${item.metadata.slug}`}
              key={item.metadata.slug}
            >
              <span className="visualizer-landing-card__meta">
                Data Structure · {item.metadata.category}
              </span>
              <h2>{item.metadata.title}</h2>
              <p>Inspect state changes and understand how the structure evolves.</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
