"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";

import type { MotionHandle, StepTransitionMode } from "@/contracts/visualization";

import { VisualizerElementRegistry } from "./element-registry";
import { GsapMotionEngine } from "./gsap-motion-engine";
import {
  StepPresentationCoordinator,
  type CommittedStepContext,
} from "./step-presentation-coordinator";

export interface MotionCoordinatorContextValue {
  readonly coordinator: StepPresentationCoordinator;
  readonly registry: VisualizerElementRegistry;
  readonly generation: number;
  readonly transitionMode: StepTransitionMode;
  readonly speed: number;
  readonly reducedMotion: boolean;
}

const MotionCoordinatorContext = createContext<MotionCoordinatorContextValue | null>(null);

export function MotionCoordinatorProvider({
  coordinator,
  generation,
  transitionMode,
  speed,
  reducedMotion,
  children,
}: {
  coordinator: StepPresentationCoordinator;
  generation: number;
  transitionMode: StepTransitionMode;
  speed: number;
  reducedMotion: boolean;
  children: ReactNode;
}): React.JSX.Element {
  const value = useMemo<MotionCoordinatorContextValue>(
    () => ({
      coordinator,
      registry: coordinator.registry,
      generation,
      transitionMode,
      speed,
      reducedMotion,
    }),
    [coordinator, generation, transitionMode, speed, reducedMotion]
  );

  useLayoutEffect(() => {
    if (transitionMode === "settle" && coordinator.hasPendingGeneration(generation)) {
      coordinator.presentCommittedStep(generation, () => null);
    }
  }, [coordinator, generation, transitionMode]);

  return (
    <MotionCoordinatorContext.Provider value={value}>{children}</MotionCoordinatorContext.Provider>
  );
}

export function useMotionCoordinator(options?: {
  speed?: number;
  reducedMotion?: boolean;
}): MotionCoordinatorContextValue {
  const parent = useContext(MotionCoordinatorContext);
  const localRef = useRef<StepPresentationCoordinator | null>(null);

  if (!parent && !localRef.current) {
    localRef.current = new StepPresentationCoordinator({
      engine: new GsapMotionEngine({
        speed: options?.speed ?? 1,
        reducedMotion: options?.reducedMotion ?? false,
      }),
      registry: new VisualizerElementRegistry(),
    });
  }

  return useMemo<MotionCoordinatorContextValue>(() => {
    if (parent) return parent;
    const coordinator = localRef.current!;
    return {
      coordinator,
      registry: coordinator.registry,
      generation: 0,
      transitionMode: "settle",
      speed: options?.speed ?? 1,
      reducedMotion: options?.reducedMotion ?? false,
    };
  }, [parent, options?.reducedMotion, options?.speed]);
}

export function useStepMotionLayout(
  stepKey: string | number,
  buildMotion: (context: CommittedStepContext) => MotionHandle | null,
  deps: readonly unknown[]
): MotionCoordinatorContextValue {
  const ctx = useMotionCoordinator();
  const buildRef = useRef(buildMotion);
  buildRef.current = buildMotion;

  useLayoutEffect(() => {
    ctx.coordinator.presentCommittedStep(ctx.generation, (committed) =>
      buildRef.current(committed)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.coordinator, ctx.generation, stepKey, ...deps]);

  return ctx;
}
