import type { Metadata } from "next";

import { canonicalMetadata } from "@/lib/seo";

import { CHALLENGE_DEFINITIONS } from "../../../content/challenges";
import { ChallengeWorkspace } from "../../../features/challenges";

export const metadata: Metadata = canonicalMetadata("/challenges", {
  title: "Algorithm Challenges — Practice & Learn | LogicLab",
  description:
    "Practice algorithmic thinking with LogicLab challenges. Predict step behavior, test execution reasoning, and inspect automated feedback.",
});

export default function ChallengesPage() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Interactive Practice</span>
          <h1>Algorithm Challenges</h1>
          <p>
            Test your comprehension, predict step execution invariants, and gain mastery from
            immediate feedback.
          </p>
        </div>
      </header>
      <ChallengeWorkspace challenges={CHALLENGE_DEFINITIONS} />
    </main>
  );
}
