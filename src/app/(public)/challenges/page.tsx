import type { Metadata } from "next";

import { canonicalMetadata } from "@/lib/seo";
import { CHALLENGE_DEFINITIONS } from "@/content/challenges";
import { ChallengeWorkspace } from "@/features/challenges";

export const metadata: Metadata = canonicalMetadata("/challenges", {
  title: "Challenges — Practice & Test | LogicLab",
  description:
    "Practice, solve and test your understanding with hands-on algorithm and data-structure challenges.",
});

export default function ChallengesPage() {
  return <ChallengeWorkspace challenges={CHALLENGE_DEFINITIONS} />;
}
