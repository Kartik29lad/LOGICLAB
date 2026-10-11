import { withTransaction } from "../../database/connection";
import type {
  ChallengeAttemptRecord,
  ChallengeAttemptRepository,
} from "./challenge-attempt-repository";

export class SqlChallengeAttemptRepository implements ChallengeAttemptRepository {
  async save(record: ChallengeAttemptRecord): Promise<void> {
    await withTransaction(async (transaction) => {
      const request = transaction.request();
      const content = await request
        .input("slug", record.contentItemId)
        .query<{ ContentItemId: string; ContentVersionId: string }>(
          `SELECT TOP 1 ci.ContentItemId, cv.ContentVersionId FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.ContentType='CHALLENGE' AND ci.Slug=@slug`
        );
      if (!content.recordset[0]) throw new Error("Challenge content version is unavailable.");
      const contentItemId = content.recordset[0].ContentItemId;
      const contentVersionId = content.recordset[0].ContentVersionId;
      const attemptRows = await transaction
        .request()
        .input("userId", record.userId)
        .input("contentItemId", contentItemId)
        .query<{ NextAttempt: number }>(
          `SELECT COALESCE(MAX(AttemptNumber),0)+1 NextAttempt FROM dbo.ChallengeAttempts WITH (UPDLOCK,HOLDLOCK) WHERE UserId=@userId AND ContentItemId=@contentItemId`
        );
      const attemptNumber = Number(attemptRows.recordset[0]?.NextAttempt ?? 1);
      await transaction
        .request()
        .input("userId", record.userId)
        .input("contentItemId", contentItemId)
        .input("contentVersionId", contentVersionId)
        .input("attemptNumber", attemptNumber)
        .input("answer", JSON.stringify({ answer: record.answer }))
        .input("evaluation", JSON.stringify(record.evaluation))
        .input(
          "feedback",
          JSON.stringify({
            feedback: record.evaluation.feedback,
            explanation: record.evaluation.explanation,
          })
        )
        .input("correct", record.evaluation.correct)
        .input("score", record.evaluation.score)
        .input("correctAnswers", record.evaluation.correct ? 1 : 0)
        .input("hints", record.hintsUsed)
        .input("time", record.timeSpentMs)
        .query(
          `INSERT INTO dbo.ChallengeAttempts (UserId,ContentItemId,ContentType,ContentVersionId,AttemptNumber,AttemptStatus,AnswerData,EvaluationData,FeedbackData,IsCorrect,Score,QuestionsAnswered,CorrectAnswers,HintsUsed,TimeSpentMs,SubmittedAt) VALUES (@userId,@contentItemId,'CHALLENGE',@contentVersionId,@attemptNumber,'EVALUATED',@answer,@evaluation,@feedback,@correct,@score,1,@correctAnswers,@hints,@time,SYSUTCDATETIME())`
        );
      await transaction
        .request()
        .input("userId", record.userId)
        .input("contentItemId", contentItemId)
        .input("contentVersionId", contentVersionId)
        .input("correct", record.evaluation.correct)
        .input("hints", record.hintsUsed)
        .query(
          `MERGE dbo.ChallengeProgress WITH (HOLDLOCK) AS target USING (SELECT @userId UserId,@contentItemId ContentItemId) source ON target.UserId=source.UserId AND target.ContentItemId=source.ContentItemId WHEN MATCHED THEN UPDATE SET Status=CASE WHEN @correct=1 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END, AttemptsCount=target.AttemptsCount+1, HintsUsed=target.HintsUsed+@hints, LastAttemptedAt=SYSUTCDATETIME(), CompletedAt=CASE WHEN @correct=1 THEN COALESCE(target.CompletedAt,SYSUTCDATETIME()) ELSE target.CompletedAt END, ContentVersionId=@contentVersionId, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT(UserId,ContentItemId,ContentType,ContentVersionId,Status,AttemptsCount,HintsUsed,FirstAttemptedAt,LastAttemptedAt,CompletedAt) VALUES(@userId,@contentItemId,'CHALLENGE',@contentVersionId,CASE WHEN @correct=1 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,1,@hints,SYSUTCDATETIME(),SYSUTCDATETIME(),CASE WHEN @correct=1 THEN SYSUTCDATETIME() END);`
        );
    });
  }
}
