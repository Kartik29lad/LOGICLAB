import type { AlgorithmDefinition } from "../../contracts/execution";
import { ExecutionEngineError } from "./execution-errors";

export class AlgorithmDefinitionRegistry {
  private readonly definitions = new Map<string, AlgorithmDefinition>();

  public register<
    TInput,
    TOutput,
    TState,
    TEvent extends import("../../contracts/execution").ExecutionEvent,
  >(definition: AlgorithmDefinition<TInput, TOutput, TState, TEvent>): void {
    if (this.definitions.has(definition.slug)) {
      throw new ExecutionEngineError(
        `Algorithm definition already registered: ${definition.slug}.`
      );
    }
    this.definitions.set(definition.slug, definition as unknown as AlgorithmDefinition);
  }

  public get<
    TInput = unknown,
    TOutput = unknown,
    TState = unknown,
    TEvent extends import("../../contracts/execution").ExecutionEvent =
      import("../../contracts/execution").ExecutionEvent,
  >(slug: string): AlgorithmDefinition<TInput, TOutput, TState, TEvent> {
    const definition = this.definitions.get(slug);
    if (!definition)
      throw new ExecutionEngineError(`No algorithm definition registered for: ${slug}.`);
    return definition as unknown as AlgorithmDefinition<TInput, TOutput, TState, TEvent>;
  }

  public has(slug: string): boolean {
    return this.definitions.has(slug);
  }

  public listSlugs(): string[] {
    return [...this.definitions.keys()].sort();
  }
}
