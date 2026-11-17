import gsap from "gsap";

import type {
  MotionEasing,
  MotionHandle,
  MotionOutcome,
  MotionResult,
  TransitionOperation,
  TransitionPlan,
} from "@/contracts/visualization";

export type MotionTimeline = gsap.core.Timeline;

export interface MotionDiagnostic {
  readonly renderer: string;
  readonly operation: string;
  readonly generation: number;
  readonly outcome: MotionOutcome;
  readonly durationMs: number;
  readonly reducedMotion: boolean;
  readonly reason?: string;
}

export interface GsapMotionEngineOptions {
  speed?: number;
  reducedMotion?: boolean;
  gsapInstance?: typeof gsap;
  onDiagnostic?: (diagnostic: MotionDiagnostic) => void;
}

export interface TimelineExecutionOptions {
  scope?: string;
  renderer?: string;
  operation?: string;
  generation?: number;
  clearProps?: string;
  skipClearPropsOnComplete?: boolean;
  onSettle?: () => void;
}

interface ActiveTimelineRecord {
  readonly scope: string;
  readonly cancel: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly setSpeed: (speed: number) => void;
}

const DEFAULT_CLEAR_PROPS = "transform,opacity,scale,filter,willChange,zIndex";

export function gsapEaseFor(easing: MotionEasing | string): string {
  switch (easing) {
    case "linear":
      return "none";
    case "ease-in":
      return "power2.in";
    case "ease-out":
      return "power2.out";
    case "ease-in-out":
    default:
      return "power2.inOut";
  }
}

export class GsapMotionEngine {
  private speed: number;
  private reducedMotion: boolean;
  private readonly gsapApi: typeof gsap;
  private readonly onDiagnostic?: (diagnostic: MotionDiagnostic) => void;
  private readonly active = new Set<ActiveTimelineRecord>();

  public constructor(options: GsapMotionEngineOptions = {}) {
    this.speed = Math.max(0.1, options.speed ?? 1);
    this.reducedMotion = Boolean(options.reducedMotion);
    this.gsapApi = options.gsapInstance ?? gsap;
    this.onDiagnostic = options.onDiagnostic;
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) this.cancelAll();
  }

  public setSpeed(speed: number): void {
    this.speed = Math.max(0.1, speed);
    for (const entry of this.active) {
      entry.setSpeed(this.speed);
    }
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getActiveCount(): number {
    return this.active.size;
  }

  public pauseAll(scope?: string): void {
    for (const entry of this.active) {
      if (!scope || entry.scope === scope) entry.pause();
    }
  }

  public resumeAll(scope?: string): void {
    for (const entry of this.active) {
      if (!scope || entry.scope === scope) entry.resume();
    }
  }

  public cancelAll(scope?: string): void {
    for (const entry of [...this.active]) {
      if (!scope || entry.scope === scope) entry.cancel();
    }
  }

  public settle(
    targets: readonly Element[],
    clearProps = DEFAULT_CLEAR_PROPS,
    onSettle?: () => void
  ): void {
    const valid = targets.filter(isDomElement);
    if (valid.length > 0) {
      try {
        this.gsapApi.set(valid, { clearProps });
      } catch {
        // Ignore cleanup failures in detached or mocked DOM nodes.
      }
    }
    onSettle?.();
  }

  public runTimeline(
    build: (timeline: gsap.core.Timeline) => void,
    targets: readonly Element[],
    options: TimelineExecutionOptions = {}
  ): MotionHandle {
    const validTargets = targets.filter(Boolean);
    const scope = options.scope ?? "default";
    const clearProps = options.clearProps ?? DEFAULT_CLEAR_PROPS;
    const renderer = options.renderer ?? "visualizer";
    const operation = options.operation ?? "step";
    const generation = options.generation ?? 0;
    const startedAt = nowMs();

    if (this.reducedMotion) {
      this.settle(validTargets, clearProps, options.onSettle);
      this.emitDiagnostic({
        renderer,
        operation,
        generation,
        outcome: "completed",
        durationMs: 0,
        reducedMotion: true,
        reason: "reduced-motion",
      });
      return settledHandle("completed", "reduced-motion");
    }

    let settled = false;
    let resolveResult!: (result: MotionResult) => void;
    const resultPromise = new Promise<MotionResult>((resolve) => {
      resolveResult = resolve;
    });

    let timeline: gsap.core.Timeline | null = null;
    const applyWillChange = (enabled: boolean): void => {
      for (const el of validTargets) {
        const htmlOrSvg = el as HTMLElement | SVGElement;
        if (htmlOrSvg.style) {
          htmlOrSvg.style.willChange = enabled ? "transform, opacity" : "";
        }
      }
    };

    const finalize = (outcome: MotionOutcome, reason?: string): void => {
      if (settled) return;
      settled = true;
      this.active.delete(record);
      applyWillChange(false);
      if (outcome !== "completed" || !options.skipClearPropsOnComplete) {
        this.settle(validTargets, clearProps, options.onSettle);
      } else {
        options.onSettle?.();
      }
      this.emitDiagnostic({
        renderer,
        operation,
        generation,
        outcome,
        durationMs: Math.max(0, Math.round(nowMs() - startedAt)),
        reducedMotion: false,
        reason,
      });
      resolveResult({ outcome, reason });
    };

    const record: ActiveTimelineRecord = {
      scope,
      cancel: () => {
        if (settled) return;
        try {
          timeline?.kill();
        } catch {
          // Always proceed to settlement.
        }
        finalize("cancelled", "cancelled");
      },
      pause: () => {
        if (!settled) timeline?.pause();
      },
      resume: () => {
        if (!settled) timeline?.resume();
      },
      setSpeed: (nextSpeed: number) => {
        if (!settled) timeline?.timeScale(Math.max(0.1, nextSpeed));
      },
    };

    try {
      applyWillChange(true);
      timeline = this.gsapApi.timeline({
        paused: true,
        onComplete: () => finalize("completed"),
      });
      timeline.timeScale(this.speed);
      build(timeline);

      if (timeline.duration() <= 0) {
        finalize("completed", "zero-duration");
        return {
          promise: resultPromise.then(() => undefined),
          result: resultPromise,
          cancel: record.cancel,
          pause: record.pause,
          resume: record.resume,
          setSpeed: record.setSpeed,
        };
      }

      this.active.add(record);
      timeline.play();
    } catch (error) {
      try {
        timeline?.kill();
      } catch {
        // Ignore secondary cleanup error.
      }
      finalize(
        "settled-after-error",
        error instanceof Error ? error.message : "Unknown GSAP timeline error"
      );
    }

    return {
      promise: resultPromise.then(() => undefined),
      result: resultPromise,
      cancel: record.cancel,
      pause: record.pause,
      resume: record.resume,
      setSpeed: record.setSpeed,
    };
  }

  public play(plan: TransitionPlan, elements: ReadonlyMap<string, Element>): MotionHandle {
    const targets: Element[] = [];
    for (const op of plan.operations) {
      const el = elements.get(op.targetId);
      if (el) targets.push(el);
    }

    if (this.reducedMotion || plan.reducedMotion === "skip") {
      for (const op of plan.operations) {
        const el = elements.get(op.targetId);
        if (el && op.property === "state" && "dataset" in el) {
          (el as HTMLElement).dataset.motionState = String(op.to ?? "settled");
        }
      }
      this.settle(targets);
      return settledHandle("completed", "reduced-motion");
    }

    return this.runTimeline(
      (tl) => {
        for (const op of plan.operations) {
          const el = elements.get(op.targetId);
          if (!el) continue;
          if (op.property === "state") {
            tl.call(() => {
              if ("dataset" in el) {
                (el as HTMLElement).dataset.motionState = String(op.to ?? "settled");
              }
            });
            continue;
          }
          const position = plan.execution === "parallel" ? 0 : ">";
          const vars = tweenVarsForOperation(op);
          tl.fromTo(
            el,
            vars.from,
            {
              ...vars.to,
              duration: Math.max(0.01, op.durationMs / 1000),
              ease: gsapEaseFor(op.easing),
            },
            position
          );
        }
      },
      targets,
      { operation: plan.intentId }
    );
  }

  public cleanup(): void {
    this.cancelAll();
  }

  private emitDiagnostic(diagnostic: MotionDiagnostic): void {
    this.onDiagnostic?.(diagnostic);
  }
}

function settledHandle(outcome: MotionOutcome, reason?: string): MotionHandle {
  const res: MotionResult = { outcome, reason };
  return {
    promise: Promise.resolve(),
    result: Promise.resolve(res),
    cancel: () => undefined,
    pause: () => undefined,
    resume: () => undefined,
    setSpeed: () => undefined,
  };
}

function tweenVarsForOperation(op: TransitionOperation): {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
} {
  switch (op.property) {
    case "opacity":
      return { from: { opacity: Number(op.from ?? 1) }, to: { opacity: Number(op.to ?? 1) } };
    case "scale":
      return { from: { scale: Number(op.from ?? 1) }, to: { scale: Number(op.to ?? 1) } };
    case "highlight":
      return {
        from: { filter: `brightness(${String(op.from ?? 1)})` },
        to: { filter: `brightness(${String(op.to ?? 1)})` },
      };
    case "transform":
    default: {
      const parsed = parseTranslate3d(String(op.from ?? "translate3d(0,0,0)"));
      return {
        from: { x: parsed.x, y: parsed.y },
        to: { x: 0, y: 0 },
      };
    }
  }
}

function parseTranslate3d(transform: string): { x: number; y: number } {
  const match = /translate3d\(\s*([-\d.]+)px,\s*([-\d.]+)px/.exec(transform);
  if (!match) return { x: 0, y: 0 };
  return { x: Number(match[1]) || 0, y: Number(match[2]) || 0 };
}

function isDomElement(element: Element | null | undefined): element is Element {
  return (
    typeof window !== "undefined" &&
    Boolean(element) &&
    typeof (element as { nodeType?: unknown }).nodeType === "number"
  );
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
