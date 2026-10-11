import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { absoluteUrl, canonicalMetadata } from "@/lib/seo";
import { getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";
import { JsonLd } from "@/components/seo/json-ld";
import { DiscoveryDetail } from "@/features/algorithms/detail-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ algorithmSlug: string }>;
}): Promise<Metadata> {
  const { algorithmSlug } = await params;
  const item = getDiscoveryItem(algorithmSlug, "ALGORITHM");
  if (!item)
    return canonicalMetadata(`/algorithms/${algorithmSlug}`, {
      title: "Algorithm Not Found",
      noIndex: true,
    });
  return canonicalMetadata(`/algorithms/${item.metadata.slug}`, {
    title: `${item.metadata.title} — Interactive Algorithm Guide`,
    description: `${item.metadata.summary} Learn how it works, explore its complexity, code, examples, and interactive visualization in LogicLab.`,
  });
}

export function generateStaticParams() {
  return getDiscoveryContent("ALGORITHM").map((item) => ({ algorithmSlug: item.metadata.slug }));
}

export default async function AlgorithmDetailPage({
  params,
}: {
  params: Promise<{ algorithmSlug: string }>;
}) {
  const { algorithmSlug } = await params;
  const item = getDiscoveryItem(algorithmSlug, "ALGORITHM");
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
          url: absoluteUrl(`/algorithms/${item.metadata.slug}`),
          learningResourceType: "Algorithm tutorial",
          educationalLevel: item.metadata.difficulty.toLowerCase(),
          keywords: item.metadata.tags.join(", "),
        }}
      />
      <DiscoveryDetail item={item} type="algorithms" />
    </>
  );
}
