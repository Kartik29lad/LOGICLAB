import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { canonicalMetadata } from "@/lib/seo";
import { CHALLENGE_DEFINITIONS } from "@/content/challenges";
import { ChallengeWorkspace } from "@/features/challenges";

export function generateStaticParams() {
  return CHALLENGE_DEFINITIONS.map((challenge) => ({
    challengeId: challenge.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}): Promise<Metadata> {
  const { challengeId } = await params;
  const challenge = CHALLENGE_DEFINITIONS.find(
    (item) => item.id === challengeId || item.slug === challengeId
  );
  if (!challenge) {
    return canonicalMetadata(`/challenges/${challengeId}`, {
      title: "Challenge Not Found",
      noIndex: true,
    });
  }
  return canonicalMetadata(`/challenges/${challenge.id}`, {
    title: `${challenge.title} — Challenge | LogicLab`,
    description: challenge.description,
  });
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  const challenge = CHALLENGE_DEFINITIONS.find(
    (item) => item.id === challengeId || item.slug === challengeId
  );
  if (!challenge) notFound();

  return (
    <ChallengeWorkspace challenges={CHALLENGE_DEFINITIONS} initialChallengeId={challenge.id} />
  );
}
