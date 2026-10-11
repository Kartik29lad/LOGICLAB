import type { Metadata } from "next";

import { canonicalMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/ui/status";

export const metadata: Metadata = canonicalMetadata("/playground/graph", {
  title: "Graph Playground — Interactive Graph Sandbox",
  description:
    "Prepare dedicated interactive graph topology editing, traversal inspection, and layout sandbox.",
});

export default function Page() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Playground</span>
          <h1>Graph Playground</h1>
          <p>Prepare a dedicated interactive graph editing and traversal surface.</p>
        </div>
      </header>
      <EmptyState
        title="Experience coming in a later phase"
        description="The application shell and route container are ready. Dedicated interactive graph playground features will be added in their scheduled implementation phase."
      />
    </main>
  );
}
