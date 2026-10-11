"use client";

import { useEffect, useMemo } from "react";

import type { VisualizationState } from "@/contracts/events/visualization-state";
import { resolveAnimationIntent } from "@/core/visualization/motion";
import type { PlaybackStatus } from "@/core/visualization/playback/playback-controller";
import { getDiscoveryItem } from "@/content/discovery";
import { Disclosure } from "@/components/ui/disclosure";
import { LabStatePanel } from "@/components/ui/lab-state";

import { describeExecutionStep } from "./accessibility";
import { ArrayInputPanel } from "./array-input-panel";
import { buildCompletionSummary } from "./completion-experience";
import { CompletionExperienceCard } from "./completion-experience-card";
import { DataStructureInputPanel } from "./data-structure-input-panel";
import { ExecutionTimeline } from "./execution-timeline";
import { GraphEditorPanel } from "./graph-editor-panel";
import { inspectStep } from "./learning-inspector";
import { LearningPanels } from "./learning-panels";
import { PredictionPanel } from "./prediction-panel";
import { PresentationMode } from "./presentation-mode";
import { traceStepToVisualization } from "./render-state";
import { renderVisualization } from "./renderer-registry";
import { TreeExperimentPanel } from "./tree-experiment-panel";
import { useVisualizerExecution } from "./use-visualizer-execution";
import { useVisualizerShortcuts } from "./use-visualizer-shortcuts";
import { VisualizerModeToggle } from "./visualizer-mode-toggle";
import { VisualizerPlaybackBar } from "./visualizer-playback-bar";
import { getEducationalCue, getVisualizerPolishProfile } from "./visualizer-polish";
import {
  useVisualizerInputState,
  useVisualizerInteractionState,
} from "./visualizer-workspace-state";
import { getFocusVisibility } from "./workspace-modes";

interface VisualizerWorkspaceProps {
  slug: string;
  title: string;
  visualizationType: string;
}

export function VisualizerWorkspace({
  slug,
  title,
  visualizationType,
}: VisualizerWorkspaceProps): React.JSX.Element {
  const {
    arrayInput,
    setArrayInput,
    searchTarget,
    setSearchTarget,
    graphExperiment,
    setGraphExperiment,
    treeExperiment,
    setTreeExperiment,
    linearInput,
    setLinearInput,
  } = useVisualizerInputState();

  const {
    predictionMode,
    setPredictionMode,
    focusMode,
    setFocusMode,
    presentationMode,
    setPresentationMode,
    fullscreen,
    setFullscreen,
  } = useVisualizerInteractionState();

  const {
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
  } = useVisualizerExecution({
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
  });

  const visualization = useMemo<VisualizationState | null>(
    () =>
      trace ? traceStepToVisualization(slug, trace, trace.steps[step]!, mapStatus(status)) : null,
    [slug, trace, step, status]
  );
  const content = useMemo(() => getDiscoveryItem(slug), [slug]);
  const inspection = useMemo(
    () =>
      content && trace
        ? inspectStep(
            content,
            trace,
            trace.steps[step]!,
            trace.steps[step + 1],
            trace.steps[step - 1]
          )
        : null,
    [content, trace, step]
  );

  const animationIntent =
    trace && trace.steps[step] ? resolveAnimationIntent(trace.steps[step].event) : null;

  const isArrayVisualizer = visualizationType === "array";
  const isGraphVisualizer = visualizationType === "graph";
  const isTreeVisualizer = visualizationType === "tree";
  const isLinearStructure = ["stack", "queue", "linked-list", "hash-table", "heap"].includes(slug);

  const currentEvent = trace?.steps[step]?.event.type;
  const accessibility = describeExecutionStep(
    title,
    step,
    trace?.steps.length ?? 0,
    currentEvent ?? "START",
    trace?.steps[step]?.event.description
  );
  const reducedMotion =
    typeof document !== "undefined" && document.documentElement.dataset.reducedMotion === "true";
  const polish = getVisualizerPolishProfile(focusMode, reducedMotion);
  const educationalCue = getEducationalCue(currentEvent);
  const completion = trace && status === "COMPLETED" ? buildCompletionSummary(trace) : null;
  const visibility = getFocusVisibility(focusMode);

  const renderer = visualization ? (
    renderVisualization(visualization.visualization, {
      speed,
      reducedMotion,
      animationIntent,
      resetKey: `${visualization.executionTraceStep}`,
      graphEditor: isGraphVisualizer
        ? { enabled: status !== "PLAYING", onNodeMove: handleNodeMove }
        : undefined,
    })
  ) : (
    <LabStatePanel
      state={inputRevision > 0 ? "loading" : "ready"}
      title={inputRevision > 0 ? "Preparing execution" : "Ready to visualize"}
      description={
        inputRevision > 0
          ? "Building the canonical execution trace from the current input."
          : "The visualizer is preparing its deterministic starting state."
      }
    />
  );

  useVisualizerShortcuts({
    status,
    presentationMode,
    onRun: run,
    onToggleFocus: () => setFocusMode((value) => !value),
    onExitPresentation: () => setPresentationMode(false),
  });

  useEffect(() => {
    const syncFullscreen = (): void => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, [setFullscreen]);

  const toggleFullscreen = async (): Promise<void> => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
    setFullscreen(Boolean(document.fullscreenElement));
  };

  return (
    <section
      className={`visualizer-workspace logiclab-visual-language visualizer-workspace--${polish.density} ${polish.motionClass} ${polish.emphasisClass}${focusMode ? " visualizer-workspace--focus" : ""}`}
      aria-label={accessibility.label}
      role={accessibility.role}
    >
      {visibility.showInputs && isArrayVisualizer ? (
        <ArrayInputPanel
          key={slug}
          slug={slug}
          disabled={status === "PLAYING"}
          onApply={applyArrayInput}
        />
      ) : null}
      {visibility.showInputs && isGraphVisualizer ? (
        <GraphEditorPanel
          key={slug}
          slug={slug}
          disabled={status === "PLAYING"}
          graph={graphExperiment}
          onApply={applyGraphExperiment}
        />
      ) : null}
      {visibility.showInputs && isTreeVisualizer ? (
        <TreeExperimentPanel
          key={slug}
          value={treeExperiment}
          disabled={status === "PLAYING"}
          onApply={handleTreeApply}
        />
      ) : null}
      {visibility.showInputs && isLinearStructure ? (
        <DataStructureInputPanel
          key={slug}
          slug={slug as "stack" | "queue" | "linked-list" | "hash-table" | "heap"}
          disabled={status === "PLAYING"}
          onApply={(values) => {
            setLinearInput(values);
            applyArrayInput(values);
          }}
        />
      ) : null}
      {graphError ? (
        <div className="visualizer-error-banner" role="alert">
          {graphError}
        </div>
      ) : null}
      <div className="visualizer-stage-wrapper">
        {educationalCue ? (
          <div
            className={`visualizer-stage-cue visualizer-stage-cue--${educationalCue.state}`}
            role="status"
          >
            <strong>{educationalCue.title}</strong>
            <span>{educationalCue.message}</span>
          </div>
        ) : null}
        {renderer}
      </div>

      <VisualizerModeToggle
        focusMode={focusMode}
        presentationMode={presentationMode}
        fullscreen={fullscreen}
        predictionMode={predictionMode}
        onToggleFocus={() => setFocusMode((value) => !value)}
        onEnterPresentation={() => {
          setPresentationMode(true);
          controllerRef.current?.pause();
        }}
        onToggleFullscreen={() => void toggleFullscreen()}
        onTogglePrediction={() => {
          setPredictionMode((current) => !current);
          controllerRef.current?.pause();
        }}
      />

      {predictionMode && trace ? (
        <PredictionPanel
          trace={trace}
          step={step}
          onContinue={() => controllerRef.current?.next()}
        />
      ) : null}

      <VisualizerPlaybackBar
        slug={slug}
        step={step}
        maxStep={Math.max(0, (trace?.steps.length ?? 1) - 1)}
        status={status}
        speed={speed}
        hasTrace={Boolean(trace)}
        keyboardHint={accessibility.keyboardHint}
        onRun={run}
        onSpeedChange={changeSpeed}
      />

      {trace ? (
        <ExecutionTimeline
          steps={trace.steps}
          currentStep={step}
          onSeek={(nextStep) => controllerRef.current?.setStep(nextStep)}
        />
      ) : null}
      <label className="sr-only" htmlFor="visualizer-step-slider">
        Execution step
      </label>
      <input
        id="visualizer-step-slider"
        className="visualizer-slider"
        type="range"
        min="0"
        max={Math.max(0, (trace?.steps.length ?? 1) - 1)}
        value={step}
        onChange={(e) => controllerRef.current?.setStep(Number(e.target.value))}
        aria-label="Execution step"
      />
      {visibility.showMetrics ? (
        <div className="visualizer-meta">
          <div>
            <strong>Step</strong>
            <span>{step + 1}</span>
          </div>
          <div>
            <strong>Comparisons</strong>
            <span>{visualization?.metrics.comparisons ?? 0}</span>
          </div>
          <div>
            <strong>Swaps</strong>
            <span>{visualization?.metrics.swaps ?? 0}</span>
          </div>
          <div>
            <strong>Writes</strong>
            <span>{visualization?.metrics.writes ?? 0}</span>
          </div>
          <div>
            <strong>Visits</strong>
            <span>{visualization?.metrics.visits ?? 0}</span>
          </div>
        </div>
      ) : null}
      {visibility.showMetrics ? (
        <p className="visualizer-note">
          Run again uses the same deterministic trace model. Playback speed changes timing only; it
          never changes algorithm state.
        </p>
      ) : null}
      {visibility.showInspector && inspection ? (
        <Disclosure
          title="Learning Inspector"
          description="Why this event happened, what changed, and what happens next."
        >
          <LearningPanels inspection={inspection} />
        </Disclosure>
      ) : null}

      {completion ? (
        <CompletionExperienceCard
          completion={completion}
          saveState={saveState}
          savedExperimentId={savedExperimentId}
          saveError={saveError}
          onRestart={() => run("restart")}
          onReviewFromStart={() => controllerRef.current?.setStep(0)}
          onSaveExperiment={() => void saveCompletedRun()}
        />
      ) : null}

      {presentationMode && trace && inspection ? (
        <PresentationMode
          title={title}
          stepLabel={`Step ${step + 1} of ${trace.steps.length}`}
          operation={trace.steps[step]?.event.type ?? "Execution"}
          explanation={inspection.explanation.short}
          visualization={renderer}
          onPrevious={() => run("previous")}
          onNext={() => run("next")}
          onExit={() => setPresentationMode(false)}
        />
      ) : null}
    </section>
  );
}

function mapStatus(status: PlaybackStatus): VisualizationState["status"] {
  return status === "PLAYING" || status === "ANIMATING"
    ? "running"
    : status === "PAUSED"
      ? "paused"
      : status === "COMPLETED"
        ? "completed"
        : "ready";
}
