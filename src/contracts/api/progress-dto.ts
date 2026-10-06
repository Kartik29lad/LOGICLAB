/**
 * User Progress DTO Contracts
 */

export interface UpdateProgressRequestDto {
  itemSlug: string;
  itemType: "algorithm" | "data-structure" | "challenge" | "learning-path";
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  timeSpentSeconds?: number;
}

export interface ProgressSummaryDto {
  userId: string;
  algorithmsCompleted: number;
  challengesCompleted: number;
  totalTimeSpentSeconds: number;
  recentActivity: {
    itemSlug: string;
    itemType: string;
    completedAt: string;
  }[];
}
