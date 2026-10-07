export interface TraceSpan {
  name: string;
  startTime: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export class RequestTracer {
  private spans = new Map<string, TraceSpan>();

  public startSpan(spanName: string, metadata?: Record<string, unknown>): void {
    this.spans.set(spanName, {
      name: spanName,
      startTime: performance.now(),
      metadata,
    });
  }

  public endSpan(spanName: string): number | null {
    const span = this.spans.get(spanName);
    if (!span) return null;

    const durationMs = Math.round((performance.now() - span.startTime) * 100) / 100;
    span.durationMs = durationMs;
    return durationMs;
  }

  public getSpan(spanName: string): TraceSpan | undefined {
    return this.spans.get(spanName);
  }

  public getAllSpans(): TraceSpan[] {
    return Array.from(this.spans.values());
  }
}
