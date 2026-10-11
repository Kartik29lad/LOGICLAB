import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { canonicalMetadata } from "@/lib/seo";

import { CHALLENGE_DEFINITIONS } from "../../../../content/challenges";
import { ChallengeWorkspace } from "../../../../features/challenges";

export function generateStaticParams() {
  return CHALLENGE_DEFINITIONS.map((c) => ({
    challengeId: c.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}): Promise<Metadata> {
  const { challengeId } = await params;
  const challenge = CHALLENGE_DEFINITIONS.find(
    (c) => c.id === challengeId || c.slug === challengeId
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
    (c) => c.id === challengeId || c.slug === challengeId
  );
  if (!challenge) {
    notFound();
    return null;
  }

  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link href="/challenges" className="button button--secondary button--sm">
              ← All Challenges
            </Link>
          </div>
          <span className="page-header__eyebrow">Practice Exercise</span>
          <h1>{challenge.title}</h1>
          <p>{challenge.description}</p>
        </div>
      </header>
      <ChallengeWorkspace challenges={CHALLENGE_DEFINITIONS} initialChallengeId={challenge.id} />
    </main>
  );
}
