import Link from "next/link";

import type { ContentPackage } from "@/content/schema/content-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/status";

export function ContentCard({
  item,
  type,
}: Readonly<{ item: ContentPackage; type: "algorithms" | "data-structures" }>) {
  const href = `/${type}/${item.metadata.slug}`;
  const visualizerHref = item.metadata.visualizationType
    ? `/visualizer/${item.metadata.slug}`
    : undefined;
  return (
    <Card className="discovery-card">
      <div className="discovery-card__body">
        <div className="discovery-card__badges">
          <Badge tone="info">{item.metadata.category}</Badge>
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
        <div className="discovery-card__footer">
          <span>{item.metadata.learningObjectives[0] ?? "Explore this topic"}</span>
          <div className="discovery-card__actions">
            <Link className="button button--secondary button--sm" href={href}>
              Learn
            </Link>
            {visualizerHref ? (
              <Link className="button button--primary button--sm" href={visualizerHref}>
                Visualize
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
