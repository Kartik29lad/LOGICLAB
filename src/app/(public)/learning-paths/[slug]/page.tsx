import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getLearningPath, LEARNING_PATHS } from "@/core/learning/learning-path-catalog";
import { canonicalMetadata } from "@/lib/seo";
import { getDiscoveryItem } from "@/content/discovery";

export function generateStaticParams() {
  return LEARNING_PATHS.map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) {
    return canonicalMetadata(`/learning-paths/${slug}`, {
      title: "Learning Path Not Found",
      noIndex: true,
    });
  }
  return canonicalMetadata(`/learning-paths/${slug}`, {
    title: `${path.title} — Learning Path | LogicLab`,
    description: path.description,
  });
}

export default async function LearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) {
    notFound();
    return null;
  }

  const items = path.itemSlugs
    .map((itemSlug) => getDiscoveryItem(itemSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <div className="learning-path-meta-row">
            <span className="page-header__eyebrow">Curriculum Path</span>
            <span className="badge badge--primary">{path.difficulty}</span>
            <span className="badge">{items.length} Modules</span>
          </div>
          <h1>{path.title}</h1>
          <p>{path.description}</p>
        </div>
      </header>

      {path.prerequisitePathSlugs.length > 0 && (
        <section className="card learning-path-prerequisites" aria-label="Prerequisites">
          <strong>Recommended Prerequisites:</strong>
          <div className="learning-path-prerequisites__list">
            {path.prerequisitePathSlugs.map((prereqSlug) => {
              const prereq = getLearningPath(prereqSlug);
              return prereq ? (
                <Link
                  key={prereqSlug}
                  href={`/learning-paths/${prereqSlug}`}
                  className="button button--secondary button--sm"
                >
                  ← {prereq.title}
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}

      <section className="card learning-path-roadmap" aria-label="Curriculum Steps">
        <div className="card__header">
          <h2>Recommended Progression Order</h2>
          <span className="text-muted text-caption">Complete concepts in sequence</span>
        </div>
        <ol className="learning-path-step-list">
          {items.map((item, index) => {
            const isAlgo = item.metadata.type === "ALGORITHM";
            const detailHref = `/${isAlgo ? "algorithms" : "data-structures"}/${item.metadata.slug}`;
            const visualizerHref = `/visualizer/${item.metadata.slug}`;

            return (
              <li key={item.metadata.slug} className="learning-path-step-item">
                <div className="learning-path-step-item__marker" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="learning-path-step-item__body">
                  <div className="learning-path-step-item__header">
                    <div>
                      <Link href={detailHref} className="learning-path-step-item__title">
                        {item.metadata.title}
                      </Link>
                      <div className="learning-path-step-item__tags">
                        <span className="badge">
                          {item.metadata.type === "ALGORITHM" ? "Algorithm" : "Data Structure"}
                        </span>
                        <span className="badge">{item.metadata.category}</span>
                        <span className="badge badge--subtle">{item.metadata.difficulty}</span>
                      </div>
                    </div>
                    <div className="learning-path-step-item__actions">
                      <Link href={visualizerHref} className="button button--primary button--sm">
                        Visualizer ↗
                      </Link>
                      <Link href={detailHref} className="button button--secondary button--sm">
                        Guide
                      </Link>
                    </div>
                  </div>
                  <p className="learning-path-step-item__summary">{item.metadata.summary}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
