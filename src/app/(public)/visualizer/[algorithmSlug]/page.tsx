import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { canonicalMetadata } from "@/lib/seo";
import { getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";

import { VisualizerClientShell } from "./visualizer-client-shell";

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
  const category = item.metadata.category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="visualizer-route visualizer-route--workspace">
      <nav className="visualizer-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/" aria-label="Home">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3 10 9-7 9 7M5.5 9v11h13V9M9.5 20v-6h5v6" />
              </svg>
              <span>Home</span>
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/visualizer">Interactive Lab</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/algorithms">{category}</Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{item.metadata.title}</li>
        </ol>
      </nav>
      <VisualizerClientShell
        slug={algorithmSlug}
        title={item.metadata.title}
        visualizationType={item.metadata.visualizationType}
      />
    </div>
  );
}
