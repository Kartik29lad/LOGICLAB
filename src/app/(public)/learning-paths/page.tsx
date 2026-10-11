import Link from "next/link";

import { LEARNING_PATHS } from "@/core/learning/learning-path-catalog";
import { canonicalMetadata } from "@/lib/seo";

export const metadata = canonicalMetadata("/learning-paths", {
  title: "Learning Paths — Structured Algorithm & Data Structure Curriculum",
  description:
    "Follow structured, step-by-step learning paths for algorithm and data-structure concepts with prerequisites and visualizer traces.",
});

export default function LearningPathsPage() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Curriculum</span>
          <h1>Structured Learning Paths</h1>
          <p>
            Master computer science concepts systematically. Each path provides a recommended
            progression order, prerequisite guidance, and links to interactive visualizers and
            documentation.
          </p>
        </div>
      </header>
      <div className="metric-grid learning-paths-grid">
        {LEARNING_PATHS.map((path) => (
          <article className="card learning-path-card" key={path.slug}>
            <div className="learning-path-card__header">
              <span className="badge badge--primary">{path.difficulty}</span>
              <span className="text-muted text-caption">{path.itemSlugs.length} modules</span>
            </div>
            <h2>{path.title}</h2>
            <p>{path.description}</p>
            {path.prerequisitePathSlugs.length > 0 && (
              <p className="learning-path-card__prereq text-caption text-muted">
                Prerequisites: {path.prerequisitePathSlugs.join(", ")}
              </p>
            )}
            <div className="card__footer">
              <Link className="button button--secondary" href={`/learning-paths/${path.slug}`}>
                Explore Path →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
