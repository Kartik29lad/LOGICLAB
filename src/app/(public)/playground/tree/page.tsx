import type { Metadata } from "next";

import { canonicalMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/ui/status";

export const metadata: Metadata = canonicalMetadata("/playground/tree", {
  title: "Tree Playground — Interactive Tree Sandbox",
  description:
    "Prepare dedicated interactive tree structure manipulation, balancing, and traversal inspection.",
});

export default function Page() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Playground</span>
          <h1>Tree Playground</h1>
          <p>
            Prepare a dedicated interactive tree structure manipulation and visualization surface.
          </p>
        </div>
      </header>
      <EmptyState
        title="Experience coming in a later phase"
        description="The application shell and route container are ready. Dedicated interactive tree playground features will be added in their scheduled implementation phase."
      />
    </main>
  );
}
