"use client";

import { useEffect, useMemo } from "react";

import type { VisualizationState } from "@/contracts/events/visualization-state";
import type { PlaybackStatus, VisualizerRuntimePorts } from "@/contracts/visualization";
import { getDiscoveryItem } from "@/content/discovery";
import { Disclosure } from "@/components/ui/disclosure";
import { LabStatePanel } from "@/components/ui/lab-state";

import { describeExecutionStep } from "./accessibility";
import { buildCompletionSummary } from "./completion-experience";
import { CompletionExperienceCard } from "./completion-experience-card";
import { ExecutionTimeline } from "./execution-timeline";
import { inspectStep } from "./learning-inspector";
import { LearningPanels } from "./learning-panels";
import { MotionCoordinatorProvider } from "./motion/motion-context";
import { useReducedMotion } from "./motion/reduced-motion";
import { PredictionPanel } from "./prediction-panel";
import { PresentationMode } from "./presentation-mode";
import { traceStepToVisualization } from "./render-state";
import { renderVisualization } from "./renderer-registry";
import { useVisualizerExecution } from "./use-visualizer-execution";
import { useVisualizerShortcuts } from "./use-visualizer-shortcuts";
import { VisualizerInputSection } from "./visualizer-input-section";
import { VisualizerMetricsBar } from "./visualizer-metrics-bar";
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
  runtime?: VisualizerRuntimePorts;
}

export function VisualizerWorkspace({
  slug,
  title,
  visualizationType,
  runtime,
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
    stepGeneration,
    transitionMode,
    coordinator,
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
    createPlaybackController: runtime?.createPlaybackController,
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
    trace && trace.steps[step] && runtime?.resolveAnimationIntent
      ? runtime.resolveAnimationIntent(trace.steps[step].event, visualization?.visualization)
      : null;

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
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    coordinator.setReducedMotion(reducedMotion);
  }, [coordinator, reducedMotion]);
  const polish = getVisualizerPolishProfile(focusMode, reducedMotion);
  const educationalCue = getEducationalCue(currentEvent);
  const completion = trace && status === "COMPLETED" ? buildCompletionSummary(trace) : null;
  const visibility = getFocusVisibility(focusMode);

  const renderer = visualization ? (
    <MotionCoordinatorProvider
      coordinator={coordinator}
      generation={stepGeneration}
      transitionMode={transitionMode}
      speed={speed}
      reducedMotion={reducedMotion}
    >
      {renderVisualization(visualization.visualization, {
        speed,
        reducedMotion,
        animationIntent,
        algorithmSlug: slug,
        resetKey: `${visualization.executionTraceStep}`,
        graphEditor: isGraphVisualizer
          ? { enabled: status !== "PLAYING" && status !== "ANIMATING", onNodeMove: handleNodeMove }
          : undefined,
      })}
    </MotionCoordinatorProvider>
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
      <VisualizerInputSection
        slug={slug}
        showInputs={visibility.showInputs}
        disabled={status === "PLAYING" || status === "ANIMATING"}
        isArrayVisualizer={isArrayVisualizer}
        isGraphVisualizer={isGraphVisualizer}
        isTreeVisualizer={isTreeVisualizer}
        isLinearStructure={isLinearStructure}
        graphExperiment={graphExperiment}
        treeExperiment={treeExperiment}
        graphError={graphError}
        onApplyArray={applyArrayInput}
        onApplyGraph={applyGraphExperiment}
        onApplyTree={handleTreeApply}
        onApplyLinear={(values) => {
          setLinearInput(values);
          applyArrayInput(values);
        }}
      />
      <div className="visualizer-stage">
        {educationalCue ? (
          <div
            className="visualizer-educational-cue"
            data-state={educationalCue.state}
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
      {visibility.showMetrics ? (
        <VisualizerMetricsBar step={step} metrics={visualization?.metrics} />
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
