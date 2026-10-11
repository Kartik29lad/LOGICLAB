import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { absoluteUrl, canonicalMetadata } from "@/lib/seo";
import { getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";
import { JsonLd } from "@/components/seo/json-ld";
import { DiscoveryDetail } from "@/features/algorithms/detail-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ structureSlug: string }>;
}): Promise<Metadata> {
  const { structureSlug } = await params;
  const item = getDiscoveryItem(structureSlug, "DATA_STRUCTURE");
  if (!item)
    return canonicalMetadata(`/data-structures/${structureSlug}`, {
      title: "Data Structure Not Found",
      noIndex: true,
    });
  return canonicalMetadata(`/data-structures/${item.metadata.slug}`, {
    title: `${item.metadata.title} — Interactive Data Structure Guide`,
    description: `${item.metadata.summary} Learn its operations, properties, complexity, examples, and interactive behavior in LogicLab.`,
  });
}

export function generateStaticParams() {
  return getDiscoveryContent("DATA_STRUCTURE").map((item) => ({
    structureSlug: item.metadata.slug,
  }));
}

export default async function DataStructureDetailPage({
  params,
}: {
  params: Promise<{ structureSlug: string }>;
}) {
  const { structureSlug } = await params;
  const item = getDiscoveryItem(structureSlug, "DATA_STRUCTURE");
  if (!item) {
    notFound();
    return null;
  }
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: item.metadata.title,
          description: item.metadata.description,
          url: absoluteUrl(`/data-structures/${item.metadata.slug}`),
          learningResourceType: "Data structure tutorial",
          educationalLevel: item.metadata.difficulty.toLowerCase(),
          keywords: item.metadata.tags.join(", "),
        }}
      />
      <DiscoveryDetail item={item} type="data-structures" />
    </>
  );
}
