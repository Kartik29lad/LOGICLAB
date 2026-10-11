import type { Metadata } from "next";

import { canonicalMetadata } from "@/lib/seo";

import { ComparisonWorkspace } from "../../../features/compare/comparison-workspace";

export const metadata: Metadata = canonicalMetadata("/compare", {
  title: "Compare Algorithms — Step-by-Step Execution Comparison",
  description:
    "Compare algorithm complexity, operations, execution steps, and performance metrics side-by-side using identical datasets.",
});

export default function Page() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Interactive Benchmark</span>
          <h1>Compare Algorithms</h1>
          <p>
            Evaluate execution steps, operation counts, and theoretical complexities side-by-side
            using identical input datasets.
          </p>
        </div>
      </header>
      <ComparisonWorkspace />
    </main>
  );
}
