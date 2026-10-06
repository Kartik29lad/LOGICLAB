/**
 * Progress Repository Contract
 * Defines persistence abstraction for algorithm and challenge progress.
 */

export interface ProgressEntity {
  id: string;
  userId: string;
  itemSlug: string;
  itemType: "algorithm" | "data-structure" | "challenge" | "learning-path";
  status: "not_started" | "in_progress" | "completed";
  score: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface IProgressRepository {
  findByUser(userId: string): Promise<ProgressEntity[]>;
  findByUserAndItem(userId: string, itemSlug: string): Promise<ProgressEntity | null>;
  upsert(progress: Omit<ProgressEntity, "id" | "updatedAt">): Promise<ProgressEntity>;
}
