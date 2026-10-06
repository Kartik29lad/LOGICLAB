/**
 * Experiment Repository Contract
 * Defines persistence abstraction for algorithm comparison and benchmark runs.
 */

export interface ExperimentEntity {
  id: string;
  userId: string;
  title: string;
  algorithmSlugs: string[];
  inputSize: number;
  results: Record<string, unknown>;
  createdAt: Date;
}

export interface IExperimentRepository {
  create(experiment: Omit<ExperimentEntity, "id" | "createdAt">): Promise<ExperimentEntity>;
  findByUser(userId: string): Promise<ExperimentEntity[]>;
  findById(id: string): Promise<ExperimentEntity | null>;
}
