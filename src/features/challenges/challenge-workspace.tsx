"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";
import { Card, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/status";
import { getChallengeDefinition } from "../../content/challenges";
import type { ChallengeDefinition } from "../../core/challenges";

interface Props {
  challenges: readonly ChallengeDefinition[];
  initialChallengeId?: string;
}

export function ChallengeWorkspace({ challenges, initialChallengeId }: Props): React.ReactNode {
  const [selectedId, setSelectedId] = useState(
    initialChallengeId && challenges.some((c) => c.id === initialChallengeId)
      ? initialChallengeId
      : (challenges[0]?.id ?? "")
  );
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [result, setResult] = useState<null | {
    correct: boolean;
    score: number;
    maxScore: number;
    feedback: string;
    explanation: string;
    correctAnswer: string;
  }>(null);
  const [submitting, setSubmitting] = useState(false);
  const challenge = useMemo(() => getChallengeDefinition(selectedId), [selectedId]);

  if (!challenge) {
    return (
      <div className="card">
        <p>No challenges are currently available.</p>
      </div>
    );
  }

  async function submit(): Promise<void> {
    if (!challenge) return;
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer, hintsUsed }),
      });
      const payload = (await response.json()) as {
        evaluation?: typeof result;
        error?: { message: string };
      };
      if (!response.ok || !payload.evaluation)
        throw new Error(payload.error?.message ?? "Unable to submit challenge.");
      setResult(payload.evaluation);
    } catch (error) {
      setResult({
        correct: false,
        score: 0,
        maxScore: challenge.score,
        feedback: error instanceof Error ? error.message : "Unable to submit challenge.",
        explanation: "",
        correctAnswer: "",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function chooseChallenge(id: string): void {
    setSelectedId(id);
    setAnswer("");
    setHintsUsed(0);
    setResult(null);
  }

  return (
    <div className="challenge-workspace">
      <aside className="challenge-workspace__sidebar" aria-label="Challenges Catalog">
        <Card>
          <CardHeader
            eyebrow="Practice"
            title="Challenge Catalog"
            description="Choose a focused concept to test."
          />
          <div className="challenge-list" role="list">
            {challenges.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`challenge-list__item ${item.id === challenge.id ? "is-active" : ""}`}
                onClick={() => chooseChallenge(item.id)}
                aria-current={item.id === challenge.id ? "true" : undefined}
              >
                <span className="challenge-list__item-title">{item.title}</span>
                <div className="challenge-list__item-meta">
                  <Badge
                    tone={
                      item.difficulty === "ADVANCED"
                        ? "danger"
                        : item.difficulty === "INTERMEDIATE"
                          ? "warning"
                          : "info"
                    }
                  >
                    {item.difficulty}
                  </Badge>
                  <span className="text-caption text-muted">{item.score} pts</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </aside>

      <section className="challenge-workspace__main" aria-live="polite">
        <Card>
          <div className="challenge-main__header">
            <CardHeader
              eyebrow={`${challenge.algorithmSlug} · ${challenge.interaction.replace("_", " ")}`}
              title={challenge.title}
              description={challenge.description}
            />
            <div className="challenge-main__links">
              <Link
                href={`/visualizer/${challenge.algorithmSlug}`}
                className="button button--secondary button--sm"
              >
                Visualizer ↗
              </Link>
              <Link
                href={`/algorithms/${challenge.algorithmSlug}`}
                className="button button--secondary button--sm"
              >
                Guide
              </Link>
            </div>
          </div>

          <div className="challenge-prompt">
            <h2>{challenge.prompt}</h2>
          </div>

          {challenge.options ? (
            <div className="challenge-options" role="radiogroup" aria-label="Challenge Options">
              {challenge.options.map((option) => (
                <label
                  key={option.id}
                  className={`challenge-option ${answer === option.label ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={challenge.id}
                    value={option.label}
                    checked={answer === option.label}
                    onChange={() => setAnswer(option.label)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <label className="challenge-answer">
              <span>Your answer</span>
              <input
                className="input"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                maxLength={2000}
                placeholder="Type your answer here…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
          )}

          <div className="challenge-actions">
            <Button
              variant="secondary"
              onClick={() => setHintsUsed((value) => Math.min(challenge.maxHints, value + 1))}
              disabled={hintsUsed >= challenge.maxHints || submitting}
            >
              Hint {hintsUsed}/{challenge.maxHints}
            </Button>
            <Button onClick={submit} disabled={!answer.trim() || submitting}>
              {submitting ? "Evaluating…" : "Submit Answer"}
            </Button>
          </div>

          {hintsUsed > 0 && (
            <div className="challenge-hint" role="status">
              <strong>Hint:</strong> {challenge.hints[hintsUsed - 1]}
            </div>
          )}
        </Card>

        {result && (
          <Card
            className={`challenge-result ${result.correct ? "challenge-result--correct" : "challenge-result--retry"}`}
          >
            <CardHeader
              eyebrow={result.correct ? "Evaluation: Correct" : "Evaluation: Try Again"}
              title={`Score: ${result.score} / ${result.maxScore}`}
              description={result.feedback}
            />
            {result.explanation && <p className="challenge-explanation">{result.explanation}</p>}
            {result.correctAnswer && !result.correct && (
              <p className="challenge-expected">
                <strong>Expected:</strong> {result.correctAnswer}
              </p>
            )}
            <div className="challenge-result__actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setResult(null);
                  setAnswer("");
                }}
              >
                Reset & Try Again
              </Button>
              <Link
                href={`/visualizer/${challenge.algorithmSlug}`}
                className="button button--primary"
              >
                Explore Visualizer ↗
              </Link>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
