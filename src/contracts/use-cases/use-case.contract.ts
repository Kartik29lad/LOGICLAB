/**
 * Base Application Use Case Contract
 * Encapsulates single-responsibility application service orchestration.
 */

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
