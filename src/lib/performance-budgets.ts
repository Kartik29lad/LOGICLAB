/** Performance budgets used for repeatable CI/manual performance checks. */
export const PERFORMANCE_BUDGETS = Object.freeze({
  publicRouteServerMs: 500,
  publicApiServerMs: 300,
  visualizerTraceStartupMs: 250,
  visualizerTraceEvents: 2_000,
  visualizerInputItems: 5_000,
} as const);

export type PerformanceBudgetKey = keyof typeof PERFORMANCE_BUDGETS;

export function exceedsPerformanceBudget(key: PerformanceBudgetKey, value: number): boolean {
  return value > PERFORMANCE_BUDGETS[key];
}
