import Link from "next/link";

import { getDiscoveryItem } from "@/content/discovery";
import type { ContentPackage } from "@/content/schema/content-types";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/status";
import { ContentActions } from "@/features/activity/content-actions";

function relatedItems(item: ContentPackage): ContentPackage[] {
  return item.metadata.relatedContent
    .map((relation) => getDiscoveryItem(relation.slug))
    .filter((value): value is ContentPackage => Boolean(value));
}

export function DiscoveryDetail({
  item,
  type,
}: Readonly<{ item: ContentPackage; type: "algorithms" | "data-structures" }>) {
  const related = relatedItems(item);
  const prerequisites = item.metadata.prerequisites
    .map((slug) => getDiscoveryItem(slug))
    .filter((value): value is ContentPackage => Boolean(value));
  const playgroundHref =
    item.metadata.visualizationType === "graph"
      ? "/playground/graph"
      : item.metadata.visualizationType === "tree"
        ? "/playground/tree"
        : null;
  return (
    <article className="detail-page">
      <header className="page-header detail-page__header">
        <div>
          <Link className="detail-page__back" href={`/${type}`}>
            ← Back to {type}
          </Link>
          <div className="discovery-card__badges">
            <Badge tone="info">{item.metadata.category}</Badge>
            <Badge>{item.metadata.difficulty}</Badge>
          </div>
          <h1>{item.metadata.title}</h1>
          <ContentActions slug={item.metadata.slug} />
          <p>{item.metadata.description}</p>
        </div>
        {type === "algorithms" || item.metadata.visualizationType ? (
          <Link className="button button--primary" href={`/visualizer/${item.metadata.slug}`}>
            Visualize
          </Link>
        ) : playgroundHref ? (
          <Link className="button button--primary" href={playgroundHref}>
            Open playground
          </Link>
        ) : null}
      </header>
      <div className="detail-layout">
        <main className="detail-content">
          <Card>
            <CardHeader
              eyebrow="Main idea"
              title="Understand the idea"
              description={item.metadata.mainIdea ?? item.explanation}
            />
            <div className="detail-section">
              <p>{item.explanation}</p>
            </div>
          </Card>
          <Card>
            <CardHeader eyebrow="Learning objectives" title="What you will learn" />
            <ul className="detail-list">
              {item.metadata.learningObjectives.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </Card>
          {item.metadata.properties?.length ? (
            <Card>
              <CardHeader eyebrow="Properties" title="Key characteristics" />
              <ul className="detail-list">
                {item.metadata.properties.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </Card>
          ) : null}
          {item.metadata.useCases?.length ? (
            <Card>
              <CardHeader eyebrow="Use cases" title="Where it helps" />
              <ul className="detail-list">
                {item.metadata.useCases.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </Card>
          ) : null}
          {item.metadata.howItWorks?.length ? (
            <Card>
              <CardHeader eyebrow="How it works" title="Step by step" />
              <ol className="detail-list detail-list--ordered">
                {item.metadata.howItWorks.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ol>
            </Card>
          ) : null}
          {item.metadata.complexity ? (
            <Card>
              <CardHeader eyebrow="Complexity" title="Performance" />
              <div className="complexity-grid">
                <div>
                  <span>Best</span>
                  <strong>{item.metadata.complexity.timeBest}</strong>
                </div>
                <div>
                  <span>Average</span>
                  <strong>{item.metadata.complexity.timeAverage}</strong>
                </div>
                <div>
                  <span>Worst</span>
                  <strong>{item.metadata.complexity.timeWorst}</strong>
                </div>
                <div>
                  <span>Space</span>
                  <strong>{item.metadata.complexity.space}</strong>
                </div>
              </div>
            </Card>
          ) : null}
        </main>
        <aside className="detail-sidebar">
          <Card>
            <CardHeader eyebrow="Prerequisites" title="Learn these first" />
            {prerequisites.length ? (
              <ul className="detail-link-list">
                {prerequisites.map((value) => (
                  <li key={value.metadata.slug}>
                    <Link
                      href={`/${value.metadata.type === "ALGORITHM" ? "algorithms" : "data-structures"}/${value.metadata.slug}`}
                    >
                      {value.metadata.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="detail-muted">No prerequisites.</p>
            )}
          </Card>
          <Card>
            <CardHeader eyebrow="Continue learning" title="Related content" />
            {related.length ? (
              <ul className="detail-link-list">
                {related.map((value) => (
                  <li key={value.metadata.slug}>
                    <Link
                      href={`/${value.metadata.type === "ALGORITHM" ? "algorithms" : "data-structures"}/${value.metadata.slug}`}
                    >
                      {value.metadata.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="detail-muted">No related content yet.</p>
            )}
          </Card>
          <Card>
            <CardHeader
              eyebrow="Practice"
              title="Keep going"
              description="Move from the concept into an interactive experience when one is available."
            />
            <div className="detail-card-action">
              {type === "algorithms" || item.metadata.visualizationType ? (
                <Link
                  className="button button--secondary"
                  href={`/visualizer/${item.metadata.slug}`}
                >
                  Visualize {item.metadata.title}
                </Link>
              ) : playgroundHref ? (
                <Link className="button button--secondary" href={playgroundHref}>
                  Open playground
                </Link>
              ) : (
                <span className="detail-muted">
                  Interactive playground is planned for a later phase.
                </span>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}
