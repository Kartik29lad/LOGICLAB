import type { Metadata } from "next";

import { getDiscoveryContent } from "@/content/discovery";
import type { Difficulty, SourceContentType } from "@/content/schema/content-types";
import { InteractiveLab, type InteractiveLabItem } from "@/features/visualizer/interactive-lab";

export const metadata: Metadata = {
  title: "Interactive Lab — Visualize Algorithms and Data Structures",
  description:
    "Explore step-by-step algorithm and data-structure visualizers in the LogicLab Interactive Lab.",
};

export default function InteractiveLabPage() {
  const content = [...getDiscoveryContent("ALGORITHM"), ...getDiscoveryContent("DATA_STRUCTURE")];

  const items: InteractiveLabItem[] = content
    .filter((item) => item.metadata.isActive && Boolean(item.metadata.visualizationType))
    .map((item) => ({
      slug: item.metadata.slug,
      title: item.metadata.title,
      summary: item.metadata.summary,
      contentType: item.metadata.type as Extract<SourceContentType, "ALGORITHM" | "DATA_STRUCTURE">,
      category: item.metadata.category,
      difficulty: item.metadata.difficulty as Difficulty,
      visualizationType: item.metadata.visualizationType as string,
    }));

  return <InteractiveLab items={items} />;
}
