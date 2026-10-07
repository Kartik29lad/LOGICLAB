import { describe, expect, it } from "vitest";

import type { AlgorithmTrace } from "../../../src/contracts/events/trace-events";
import {
  CancellationToken,
  ExecutionContext,
  ExecutionController,
  isValidExecutionTransition,
} from "../../../src/core/execution";

describe("Phase 6: Execution Lifecycle & Controller", () => {
  const dummyTrace: AlgorithmTrace<number[], number[], number[]> = {
    algorithmSlug: "test-algo",
    category: "sorting",
    input: [3, 2, 1],
    output: [1, 2, 3],
    totalSteps: 3,
    finalMetrics: { comparisons: 2, swaps: 1, accessCount: 4, iterations: 1 },
    completed: true,
    steps: [
      {
        stepIndex: 0,
        action: "compare",
        description: "Step 0",
        stateSnapshot: [3, 2, 1],
        highlights: [],
        pointers: [],
        metrics: { comparisons: 1, swaps: 0, accessCount: 2, iterations: 1 },
      },
      {
        stepIndex: 1,
        action: "swap",
        description: "Step 1",
        stateSnapshot: [2, 3, 1],
        highlights: [],
        pointers: [],
        metrics: { comparisons: 1, swaps: 1, accessCount: 4, iterations: 1 },
      },
      {
        stepIndex: 2,
        action: "complete",
        description: "Step 2",
        stateSnapshot: [1, 2, 3],
        highlights: [],
        pointers: [],
        metrics: { comparisons: 2, swaps: 1, accessCount: 4, iterations: 1 },
      },
    ],
  };

  describe("ExecutionController", () => {
    it("initializes at step 0 in INITIALIZED status", () => {
      const controller = new ExecutionController(dummyTrace);
      expect(controller.getStatus()).toBe("INITIALIZED");
      expect(controller.getCurrentIndex()).toBe(0);
      expect(controller.getCurrentStep()?.action).toBe("compare");
    });

    it("manages playback lifecycle (start, pause, resume)", () => {
      const controller = new ExecutionController(dummyTrace);
      controller.start();
      expect(controller.getStatus()).toBe("RUNNING");

      controller.pause();
      expect(controller.getStatus()).toBe("PAUSED");

      controller.resume();
      expect(controller.getStatus()).toBe("RUNNING");
    });

    it("steps forward and backward through trace snapshots", () => {
      const controller = new ExecutionController(dummyTrace);
      expect(controller.stepForward()).toBe(true);
      expect(controller.getCurrentIndex()).toBe(1);

      expect(controller.stepForward()).toBe(true);
      expect(controller.getCurrentIndex()).toBe(2);
      expect(controller.getStatus()).toBe("COMPLETED");

      // Cannot step past last step
      expect(controller.stepForward()).toBe(false);

      // Step backward
      expect(controller.stepBackward()).toBe(true);
      expect(controller.getCurrentIndex()).toBe(1);
      expect(controller.getStatus()).toBe("PAUSED");
    });

    it("seeks to specific step indices within bounds", () => {
      const controller = new ExecutionController(dummyTrace);
      controller.seekTo(2);
      expect(controller.getCurrentIndex()).toBe(2);
      expect(controller.getStatus()).toBe("COMPLETED");

      controller.seekTo(100); // clamps to max
      expect(controller.getCurrentIndex()).toBe(2);

      controller.seekTo(0);
      expect(controller.getCurrentIndex()).toBe(0);
    });

    it("resets to beginning", () => {
      const controller = new ExecutionController(dummyTrace);
      controller.seekTo(2);
      controller.reset();
      expect(controller.getCurrentIndex()).toBe(0);
      expect(controller.getStatus()).toBe("INITIALIZED");
    });

    it("transitions to CANCELLED upon cancellation", () => {
      const controller = new ExecutionController(dummyTrace);
      controller.cancel();
      expect(controller.getStatus()).toBe("CANCELLED");
    });
  });

  describe("Lifecycle Transitions", () => {
    it("validates deterministic lifecycle transition rules", () => {
      expect(isValidExecutionTransition("CREATED", "VALIDATED")).toBe(true);
      expect(isValidExecutionTransition("VALIDATED", "INITIALIZED")).toBe(true);
      expect(isValidExecutionTransition("INITIALIZED", "RUNNING")).toBe(true);
      expect(isValidExecutionTransition("RUNNING", "PAUSED")).toBe(true);
      expect(isValidExecutionTransition("RUNNING", "COMPLETED")).toBe(true);
      expect(isValidExecutionTransition("CREATED", "COMPLETED")).toBe(false);
    });
  });

  describe("ExecutionContext & Budgets", () => {
    it("throws exception when step limit is exceeded", () => {
      const context = new ExecutionContext({ limits: { maxSteps: 3 } });
      context.recordStep();
      context.recordStep();
      context.recordStep();
      expect(() => context.recordStep()).toThrow(/Execution limit exceeded/);
    });

    it("honors cancellation tokens", () => {
      const token = new CancellationToken();
      const context = new ExecutionContext({ cancellationToken: token });
      token.cancel();
      expect(() => context.recordStep()).toThrow(/cancelled/);
    });
  });
});
