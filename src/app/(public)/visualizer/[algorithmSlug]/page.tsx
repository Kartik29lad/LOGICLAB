import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { canonicalMetadata } from "@/lib/seo";
import { getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";
import { VisualizerWorkspace } from "@/features/visualizer/visualizer-workspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ algorithmSlug: string }>;
}): Promise<Metadata> {
  const { algorithmSlug } = await params;
  const item =
    getDiscoveryItem(algorithmSlug, "ALGORITHM") ??
    getDiscoveryItem(algorithmSlug, "DATA_STRUCTURE");
  if (!item)
    return canonicalMetadata(`/visualizer/${algorithmSlug}`, {
      title: "Visualizer Not Found",
      noIndex: true,
    });
  return canonicalMetadata(`/visualizer/${item.metadata.slug}`, {
    title: `${item.metadata.title} Visualizer — Step-by-Step Algorithm`,
    description: `Visualize ${item.metadata.title} step by step with execution states, explanations, metrics, and algorithm complexity.`,
  });
}

export function generateStaticParams() {
  return [...getDiscoveryContent("ALGORITHM"), ...getDiscoveryContent("DATA_STRUCTURE")]
    .filter((item) => Boolean(item.metadata.visualizationType))
    .map((item) => ({ algorithmSlug: item.metadata.slug }));
}

export default async function AlgorithmVisualizerPage({
  params,
}: {
  params: Promise<{ algorithmSlug: string }>;
}) {
  const { algorithmSlug } = await params;
  const item =
    getDiscoveryItem(algorithmSlug, "ALGORITHM") ??
    getDiscoveryItem(algorithmSlug, "DATA_STRUCTURE");
  if (!item || !item.metadata.visualizationType) {
    notFound();
    return null;
  }
  return (
    <div className="visualizer-route">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">LogicLab Laboratory</span>
          <h1>{item.metadata.title} Visualizer</h1>
          <p>
            Execute the algorithm, inspect every canonical event, and learn from the visual state.
          </p>
        </div>
      </header>
      <VisualizerWorkspace
        slug={algorithmSlug}
        title={item.metadata.title}
        visualizationType={item.metadata.visualizationType}
      />
    </div>
  );
}
