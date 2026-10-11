import type { TransitionOperation, TransitionPlan } from "./types";

export interface MotionHandle {
  promise: Promise<void>;
  cancel: () => void;
}

export interface MotionEngineOptions {
  speed?: number;
  reducedMotion?: boolean;
}

export class MotionEngine {
  private readonly speed: number;
  private readonly reducedMotion: boolean;
  private active = new Set<Animation>();

  public constructor(options: MotionEngineOptions = {}) {
    this.speed = Math.max(0.1, options.speed ?? 1);
    this.reducedMotion = Boolean(options.reducedMotion);
  }

  public play(plan: TransitionPlan, elements: ReadonlyMap<string, HTMLElement>): MotionHandle {
    const animations: Animation[] = [];
    if (this.reducedMotion || plan.reducedMotion === "skip") {
      for (const operation of plan.operations) {
        const element = elements.get(operation.targetId);
        if (!element) continue;
        if (operation.property === "state")
          element.dataset.motionState = String(operation.to ?? "settled");
        else element.style.setProperty("--motion-settled", "1");
      }
      return { promise: Promise.resolve(), cancel: () => undefined };
    }
    const playOperation = (operation: TransitionOperation): Animation | null => {
      const element = elements.get(operation.targetId);
      if (!element) return null;
      if (operation.property === "state") {
        if (operation.to !== undefined) element.dataset.motionState = String(operation.to);
        return null;
      }
      const animation = element.animate(keyframesFor(operation), {
        duration: Math.max(1, operation.durationMs / this.speed),
        easing: cssEasing(operation.easing),
        fill: "both",
      });
      animations.push(animation);
      this.active.add(animation);
      void animation.finished.finally(() => this.active.delete(animation));
      return animation;
    };

    const promise =
      plan.execution === "parallel"
        ? Promise.all(
            plan.operations.map((operation) =>
              playOperation(operation)?.finished.catch(() => undefined)
            )
          ).then(() => undefined)
        : playSerial(plan.operations, playOperation);

    return {
      promise,
      cancel: () => animations.forEach((animation) => animation.cancel()),
    };
  }

  public cancelAll(): void {
    for (const animation of this.active) animation.cancel();
    this.active.clear();
  }
}

async function playSerial(
  operations: readonly TransitionOperation[],
  playOperation: (operation: TransitionOperation) => Animation | null
): Promise<void> {
  for (const operation of operations) {
    const animation = playOperation(operation);
    if (animation) await animation.finished.catch(() => undefined);
  }
}

function keyframesFor(operation: TransitionOperation): Keyframe[] {
  const from = operation.from ?? defaultFrom(operation.property);
  const to = operation.to ?? defaultTo(operation.property);

  switch (operation.property) {
    case "transform":
      return [{ transform: String(from) }, { transform: String(to) }];
    case "scale":
      return [{ transform: `scale(${String(from)})` }, { transform: `scale(${String(to)})` }];
    case "opacity":
      return [{ opacity: Number(from) }, { opacity: Number(to) }];
    case "highlight":
      return [{ filter: `brightness(${String(from)})` }, { filter: `brightness(${String(to)})` }];
    default:
      return [{}, {}];
  }
}

function defaultFrom(property: TransitionOperation["property"]): string | number {
  if (property === "opacity") return 1;
  if (property === "scale") return 1;
  if (property === "highlight") return 1;
  return "none";
}

function defaultTo(property: TransitionOperation["property"]): string | number {
  if (property === "opacity") return 1;
  if (property === "scale") return 1;
  if (property === "highlight") return 1;
  return "none";
}

function cssEasing(easing: string): string {
  if (easing === "linear") return "linear";
  if (easing === "ease-in") return "cubic-bezier(0.4, 0, 1, 1)";
  if (easing === "ease-out") return "cubic-bezier(0, 0, 0.2, 1)";
  return "cubic-bezier(0.2, 0, 0, 1)";
}
