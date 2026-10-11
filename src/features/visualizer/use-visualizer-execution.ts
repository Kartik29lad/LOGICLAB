"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";
import {
  PlaybackController,
  type PlaybackStatus,
} from "@/core/visualization/playback/playback-controller";

import { createDemoTrace } from "./demo-traces";
import {
  cloneGraphExperiment,
  DEFAULT_GRAPH_EXPERIMENT,
  validateGraphExperiment,
  type GraphExperiment,
} from "./graph-editor";
import { guardPlaybackInteraction } from "./interaction-safety";
import { validateTraceBudget } from "./resource-limits";
import {
  cloneTreeExperiment,
  DEFAULT_TREE_EXPERIMENT,
  type TreeExperiment,
} from "./tree-laboratory";
import { buildVisualizerPersistencePayload, persistVisualizerRun } from "./visualizer-persistence";

interface UseVisualizerExecutionOptions {
  slug: string;
  title: string;
  visualizationType: string;
  arrayInput: number[];
  setArrayInput: (values: number[]) => void;
  searchTarget?: number;
  setSearchTarget: (target?: number) => void;
  graphExperiment: GraphExperiment;
  setGraphExperiment: (graph: GraphExperiment) => void;
  treeExperiment: TreeExperiment;
  setTreeExperiment: (tree: TreeExperiment) => void;
  linearInput: number[];
  setPredictionMode: (value: boolean) => void;
  setFocusMode: (value: boolean) => void;
  setPresentationMode: (value: boolean) => void;
}

export function useVisualizerExecution({
  slug,
  title,
  visualizationType,
  arrayInput,
  setArrayInput,
  searchTarget,
  setSearchTarget,
  graphExperiment,
  setGraphExperiment,
  treeExperiment,
  setTreeExperiment,
  linearInput,
  setPredictionMode,
  setFocusMode,
  setPresentationMode,
}: UseVisualizerExecutionOptions) {
  const [trace, setTrace] = useState<CanonicalExecutionTrace<unknown, unknown, unknown> | null>(
    null
  );
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>("READY");
  const [speed, setSpeed] = useState(1);
  const [inputRevision, setInputRevision] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedExperimentId, setSavedExperimentId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);

  const controllerRef = useRef<PlaybackController<unknown> | null>(null);
  const traceRequestRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const requestId = ++traceRequestRef.current;
    setTrace(null);
    setStep(0);
    setStatus("READY");
    setArrayInput([]);
    setSearchTarget(undefined);
    setGraphExperiment(cloneGraphExperiment(DEFAULT_GRAPH_EXPERIMENT));
    setGraphError(null);
    setTreeExperiment(cloneTreeExperiment(DEFAULT_TREE_EXPERIMENT));
    setInputRevision(0);
    setPredictionMode(false);
    setFocusMode(false);
    setPresentationMode(false);
    setSaveState("idle");
    setSavedExperimentId(null);
    setSaveError(null);
    void createDemoTrace(slug).then((nextTrace) => {
      if (requestId !== traceRequestRef.current) return;
      const budget = validateTraceBudget(nextTrace.steps.length);
      if (!budget.valid) {
        setGraphError(budget.message ?? "Execution exceeds the visualizer resource budget.");
        return;
      }
      setTrace(nextTrace);
    });
  }, [
    slug,
    setArrayInput,
    setFocusMode,
    setGraphExperiment,
    setPredictionMode,
    setPresentationMode,
    setSearchTarget,
    setTreeExperiment,
  ]);

  const applyArrayInput = (values: number[], target?: number): void => {
    traceRequestRef.current += 1;
    setArrayInput(values);
    setSearchTarget(target);
    setInputRevision((revision) => revision + 1);
    setTrace(null);
    setStep(0);
    setStatus("READY");
  };

  const applyGraphExperiment = (nextGraph: GraphExperiment): void => {
    const validationError = validateGraphExperiment(nextGraph, slug);
    if (validationError) {
      setGraphError(validationError);
      return;
    }
    traceRequestRef.current += 1;
    setGraphExperiment(cloneGraphExperiment(nextGraph));
    setGraphError(null);
    setTrace(null);
    setStep(0);
    setStatus("READY");
    setInputRevision((revision) => revision + 1);
  };

  const handleTreeApply = (next: TreeExperiment): void => {
    traceRequestRef.current += 1;
    setTreeExperiment(cloneTreeExperiment(next));
    setTrace(null);
    setStep(0);
    setStatus("READY");
    setInputRevision((revision) => revision + 1);
  };

  const handleNodeMove = (nodeId: string, x: number, y: number): void => {
    const nextGraph = cloneGraphExperiment(graphExperiment);
    const node = nextGraph.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) return;
    node.x = Math.round(x);
    node.y = Math.round(y);
    applyGraphExperiment(nextGraph);
  };

  useEffect(() => {
    if (inputRevision === 0) return;
    const requestId = traceRequestRef.current;
    const options = ["bfs", "dfs", "dijkstra", "a-star"].includes(slug)
      ? { graph: graphExperiment }
      : slug === "binary-search-tree"
        ? { tree: treeExperiment }
        : ["stack", "queue", "linked-list", "hash-table", "heap"].includes(slug)
          ? { array: linearInput }
          : { array: arrayInput, target: searchTarget };
    void createDemoTrace(slug, options).then((nextTrace) => {
      if (requestId !== traceRequestRef.current) return;
      const budget = validateTraceBudget(nextTrace.steps.length);
      if (!budget.valid) {
        setTrace(null);
        setStatus("READY");
        setGraphError(budget.message ?? "Execution exceeds the visualizer resource budget.");
        return;
      }
      setGraphError(null);
      setTrace(nextTrace);
    });
  }, [arrayInput, graphExperiment, inputRevision, linearInput, searchTarget, slug, treeExperiment]);

  useEffect(() => {
    if (!trace) return;
    const controller = new PlaybackController({ trace, onStep: setStep, onStatus: setStatus });
    controller.setSpeed(speedRef.current);
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [trace]);

  useEffect(() => {
    controllerRef.current?.setSpeed(speed);
  }, [speed]);

  const run = useCallback(
    (action: "play" | "pause" | "next" | "previous" | "restart"): void => {
      const guard = guardPlaybackInteraction(action, status, trace?.steps.length ?? 0);
      if (!guard.allowed) return;
      controllerRef.current?.[action]();
    },
    [status, trace]
  );

  const changeSpeed = (value: number): void => {
    setSpeed(value);
    controllerRef.current?.setSpeed(value);
  };

  const saveCompletedRun = async (): Promise<void> => {
    if (!trace || status !== "COMPLETED" || saveState === "saving" || saveState === "saved") return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const configuration: Record<string, unknown> = { visualizationType, speed };
      if (typeof searchTarget === "number") configuration.searchTarget = searchTarget;
      if (visualizationType === "graph") configuration.graph = graphExperiment;
      if (visualizationType === "tree") configuration.tree = treeExperiment;
      const result = await persistVisualizerRun(
        buildVisualizerPersistencePayload(trace, title, configuration),
        `visualizer:${trace.executionId}`
      );
      setSavedExperimentId(result.experimentId);
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error ? error.message : "This visualizer run could not be saved."
      );
    }
  };

  return {
    trace,
    step,
    status,
    speed,
    inputRevision,
    saveState,
    savedExperimentId,
    saveError,
    graphError,
    controllerRef,
    run,
    changeSpeed,
    applyArrayInput,
    applyGraphExperiment,
    handleTreeApply,
    handleNodeMove,
    saveCompletedRun,
  };
}
