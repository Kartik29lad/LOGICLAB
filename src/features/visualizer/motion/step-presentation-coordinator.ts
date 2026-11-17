import type {
  MotionHandle,
  PlaybackStepRequest,
  StepTransitionMode,
} from "@/contracts/visualization";

import { VisualizerElementRegistry, type ElementRectSnapshot } from "./element-registry";
import { GsapMotionEngine } from "./gsap-motion-engine";

export interface StepCommitMeta {
  readonly stepIndex: number;
  readonly generation: number;
  readonly mode: StepTransitionMode;
}

export interface CommittedStepContext {
  readonly generation: number;
  readonly mode: StepTransitionMode;
  readonly prevRects: ReadonlyMap<string, ElementRectSnapshot>;
  readonly nextRects: ReadonlyMap<string, ElementRectSnapshot>;
  readonly engine: GsapMotionEngine;
  readonly registry: VisualizerElementRegistry;
}

interface PendingStepEntry {
  readonly generation: number;
  readonly mode: StepTransitionMode;
  readonly prevRects: Map<string, ElementRectSnapshot>;
  readonly resolve: () => void;
  readonly safetyTimer?: ReturnType<typeof setTimeout>;
  handle?: MotionHandle;
  settled: boolean;
}

const DEFAULT_READINESS_TIMEOUT_MS = 2500;

export class StepPresentationCoordinator {
  public readonly engine: GsapMotionEngine;
  public readonly registry: VisualizerElementRegistry;
  private readonly readinessTimeoutMs: number;
  private pending: PendingStepEntry | null = null;
  private latestGeneration = 0;

  public constructor(
    options: {
      engine?: GsapMotionEngine;
      registry?: VisualizerElementRegistry;
      readinessTimeoutMs?: number;
    } = {}
  ) {
    this.engine = options.engine ?? new GsapMotionEngine();
    this.registry = options.registry ?? new VisualizerElementRegistry();
    this.readinessTimeoutMs = options.readinessTimeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS;
  }

  public beginStepTransition(
    request: PlaybackStepRequest,
    commitReactStep: (meta: StepCommitMeta) => void
  ): Promise<void> {
    this.cancelActive();
    this.latestGeneration = Math.max(this.latestGeneration + 1, request.generation);
    const generation = this.latestGeneration;

    const prevRects =
      request.mode === "animate"
        ? this.registry.measureRects()
        : new Map<string, ElementRectSnapshot>();

    return new Promise<void>((resolve) => {
      const entry: PendingStepEntry = {
        generation,
        mode: request.mode,
        prevRects,
        resolve,
        settled: false,
        safetyTimer: setTimeout(() => {
          if (this.pending === entry && !entry.settled) {
            this.resolveEntry(entry);
          }
        }, this.readinessTimeoutMs),
      };

      this.pending = entry;
      commitReactStep({
        stepIndex: request.stepIndex,
        generation,
        mode: request.mode,
      });
    });
  }

  public presentCommittedStep(
    generation: number,
    buildMotion: (context: CommittedStepContext) => MotionHandle | null
  ): void {
    const entry = this.pending;
    if (!entry || entry.settled || entry.generation !== generation) {
      return;
    }

    if (entry.safetyTimer !== undefined) {
      clearTimeout(entry.safetyTimer);
    }

    if (entry.mode === "settle") {
      this.engine.cancelAll();
      this.engine.settle([...this.registry.getAll().values()]);
      this.resolveEntry(entry);
      return;
    }

    const nextRects = this.registry.measureRects();
    let handle: MotionHandle | null = null;
    try {
      handle = buildMotion({
        generation,
        mode: entry.mode,
        prevRects: entry.prevRects,
        nextRects,
        engine: this.engine,
        registry: this.registry,
      });
    } catch {
      this.engine.settle([...this.registry.getAll().values()]);
      this.resolveEntry(entry);
      return;
    }

    if (!handle) {
      this.resolveEntry(entry);
      return;
    }

    entry.handle = handle;
    void handle.promise.finally(() => {
      if (this.pending === entry && !entry.settled) {
        this.resolveEntry(entry);
      }
    });
  }

  public hasPendingGeneration(generation: number): boolean {
    return Boolean(this.pending && !this.pending.settled && this.pending.generation === generation);
  }

  public pauseActive(): void {
    this.pending?.handle?.pause?.();
  }

  public resumeActive(): void {
    this.pending?.handle?.resume?.();
  }

  public setSpeed(speed: number): void {
    this.engine.setSpeed(speed);
    this.pending?.handle?.setSpeed?.(speed);
  }

  public setReducedMotion(reduced: boolean): void {
    this.engine.setReducedMotion(reduced);
    if (reduced && this.pending && !this.pending.settled) {
      this.resolveEntry(this.pending);
    }
  }

  public cancelActive(): void {
    this.latestGeneration += 1;
    const entry = this.pending;
    if (!entry) {
      this.engine.cancelAll();
      return;
    }
    if (entry.safetyTimer !== undefined) {
      clearTimeout(entry.safetyTimer);
    }
    entry.handle?.cancel();
    this.engine.cancelAll();
    this.resolveEntry(entry);
  }

  public dispose(): void {
    this.cancelActive();
    this.engine.cleanup();
    this.registry.clear();
  }

  private resolveEntry(entry: PendingStepEntry): void {
    if (entry.settled) return;
    entry.settled = true;
    if (entry.safetyTimer !== undefined) {
      clearTimeout(entry.safetyTimer);
    }
    if (this.pending === entry) {
      this.pending = null;
    }
    entry.resolve();
  }
}
