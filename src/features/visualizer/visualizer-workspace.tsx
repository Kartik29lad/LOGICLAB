"use client";

import { useEffect, useMemo } from "react";

import type { VisualizationState } from "@/contracts/events/visualization-state";
import type { PlaybackStatus, VisualizerRuntimePorts } from "@/contracts/visualization";
import { getDiscoveryItem } from "@/content/discovery";
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
  const binarySearchComparisons =
    slug === "binary-search"
      ? (trace?.steps.filter((traceStep) => traceStep.event.type === "COMPARE").length ?? 0)
      : 0;
  const completedBinarySearchComparisons =
    slug === "binary-search"
      ? (trace?.steps.slice(0, step + 1).filter((traceStep) => traceStep.event.type === "COMPARE")
          .length ?? 0)
      : 0;
  const stageStepLabel =
    slug === "binary-search" && binarySearchComparisons > 0
      ? `Step ${Math.max(1, completedBinarySearchComparisons)} / ${binarySearchComparisons}`
      : `Step ${trace ? step + 1 : 0} / ${trace?.steps.length ?? 0}`;
  const foundSearchStep =
    slug === "binary-search" && trace
      ? trace.steps
          .slice(0, step + 1)
          .slice()
          .reverse()
          .find((traceStep) => traceStep.event.type === "FOUND")
      : undefined;
  const foundSearchPayload = (foundSearchStep?.event.payload ?? {}) as Record<string, unknown>;
  const isShowingBinarySearchResult = slug === "binary-search" && Boolean(foundSearchStep);
  const baseEducationalCue =
    getEducationalCue(currentEvent) ??
    (isShowingBinarySearchResult ? getEducationalCue("FOUND") : undefined);
  const educationalCue =
    isShowingBinarySearchResult && baseEducationalCue
      ? {
          ...baseEducationalCue,
          title: `Target ${String(foundSearchPayload.target ?? searchTarget ?? "")} found at index ${String(foundSearchPayload.index ?? "")}`,
          // The approved workspace uses a single-line success banner.
          message: "",
        }
      : baseEducationalCue;
  const accessibility = describeExecutionStep(
    title,
    slug === "binary-search" ? Math.max(0, completedBinarySearchComparisons - 1) : step,
    slug === "binary-search" ? binarySearchComparisons : (trace?.steps.length ?? 0),
    currentEvent ?? "START",
    trace?.steps[step]?.event.description
  );
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    coordinator.setReducedMotion(reducedMotion);
  }, [coordinator, reducedMotion]);
  const polish = getVisualizerPolishProfile(focusMode, reducedMotion);
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

  const rawCategoryLabel =
    content?.metadata.category ??
    (isGraphVisualizer ? "Graphs" : isArrayVisualizer ? "Arrays" : "Data Structures");
  const categoryLabel = rawCategoryLabel
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const workspaceDescription =
    slug === "binary-search"
      ? "Explore each comparison and see how the search space narrows."
      : (content?.metadata.summary ??
        "Explore each operation and see how the visualization changes step by step.");

  const foundComparisonStep =
    foundSearchStep && trace
      ? trace.steps
          .slice(0, foundSearchStep.stepIndex)
          .slice()
          .reverse()
          .find((traceStep) => traceStep.event.type === "COMPARE")
      : undefined;
  const foundComparisonPayload = (foundComparisonStep?.event.payload ?? {}) as Record<
    string,
    unknown
  >;
  const binarySearchValues = trace && Array.isArray(trace.input) ? (trace.input as number[]) : [];
  const foundTarget =
    typeof foundSearchPayload.target === "number" ? foundSearchPayload.target : (searchTarget ?? 9);
  const foundIndex = typeof foundSearchPayload.index === "number" ? foundSearchPayload.index : -1;
  const foundMiddleValue = foundIndex >= 0 ? binarySearchValues[foundIndex] : undefined;
  const binarySearchResultRows = isShowingBinarySearchResult
    ? [
        {
          label: "State",
          value: `Array: [${binarySearchValues.join(", ")}]\nlow = ${String(foundComparisonPayload.low ?? 0)}, mid = ${String(foundComparisonPayload.mid ?? foundIndex)}, high = ${String(foundComparisonPayload.high ?? Math.max(0, binarySearchValues.length - 1))}`,
        },
        { label: "Rule", value: "Compare the middle element with the target value." },
        {
          label: "Decision",
          value: `A[mid] == target (${String(foundMiddleValue ?? foundTarget)} == ${String(foundTarget)}).`,
        },
        { label: "Result", value: `Target found at index ${foundIndex}.` },
        { label: "Next", value: "Algorithm terminates (search complete)." },
      ]
    : null;
  const inspectorOperationTitle = isShowingBinarySearchResult
    ? "Target found"
    : (inspection?.operationLabel ?? "");
  const inspectorOperationDescription = isShowingBinarySearchResult
    ? "The middle element matches the target, so the search is complete."
    : (inspection?.explanation.short ?? "");
  const statusLabel =
    status === "PLAYING" || status === "ANIMATING"
      ? "Running"
      : status === "PAUSED"
        ? "Paused"
        : status === "COMPLETED"
          ? "Completed"
          : "Ready";

  const inspectorRows = inspection
    ? [
        { label: "State", value: inspection.explanation.state },
        { label: "Rule", value: inspection.explanation.rule },
        { label: "Decision", value: inspection.explanation.decision },
        { label: "Result", value: inspection.explanation.result },
        { label: "Next", value: inspection.explanation.next },
      ]
    : [];

  return (
    <section
      className={`visualizer-workspace logiclab-visual-language visualizer-workspace--${polish.density} ${polish.motionClass} ${polish.emphasisClass}${focusMode ? " visualizer-workspace--focus" : ""}`}
      aria-label={accessibility.label}
      role={accessibility.role}
    >
      <header className="visualizer-workspace__header">
        <div className="visualizer-workspace__title-group">
          <span className="visualizer-workspace__topic-icon" aria-hidden="true">
            <WorkspaceTopicIcon slug={slug} visualizationType={visualizationType} />
          </span>
          <div className="visualizer-workspace__title-copy">
            <div className="visualizer-workspace__title-line">
              <h1>{title} Visualizer</h1>
              <span className="visualizer-workspace__category">{categoryLabel}</span>
              <span className="visualizer-workspace__status" data-status={status}>
                <i aria-hidden="true">{status === "READY" ? "✓" : ""}</i> {statusLabel}
              </span>
            </div>
            <p>{workspaceDescription}</p>
          </div>
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
      </header>

      <div
        className="visualizer-workspace__columns"
        data-input-visible={visibility.showInputs ? "true" : "false"}
        data-inspector-visible={visibility.showInspector ? "true" : "false"}
      >
        <aside
          className="visualizer-workspace__input-panel"
          aria-label="Experiment input"
          hidden={!visibility.showInputs}
        >
          <div className="visualizer-workspace__panel-heading">
            <WorkspacePanelIcon kind="input" />
            <h2>Experiment Input</h2>
          </div>
          <div className="visualizer-workspace__input-content">
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
          </div>
        </aside>

        <section className="visualizer-stage" aria-label="Visualization stage">
          <div className="visualizer-stage__heading">
            <div>
              <WorkspacePanelIcon kind="visualization" />
              <h2>Visualization Stage</h2>
            </div>
            <span>{stageStepLabel}</span>
          </div>
          <div className="visualizer-stage__canvas">
            {educationalCue ? (
              <div
                className="visualizer-educational-cue"
                data-state={educationalCue.state}
                role="status"
              >
                <strong>{educationalCue.title}</strong>
                {educationalCue.message ? <span>{educationalCue.message}</span> : null}
              </div>
            ) : null}
            {renderer}
            {predictionMode && trace ? (
              <div className="visualizer-stage__prediction">
                <PredictionPanel
                  trace={trace}
                  step={step}
                  onContinue={() => controllerRef.current?.next()}
                />
              </div>
            ) : null}
          </div>
        </section>

        <aside
          className="visualizer-workspace__inspector-panel"
          aria-label="Learning inspector"
          hidden={!visibility.showInspector}
        >
          <div className="visualizer-workspace__panel-heading">
            <WorkspacePanelIcon kind="inspector" />
            <h2>Learning Inspector</h2>
          </div>
          {inspection ? (
            <>
              <div className="visualizer-inspector__operation">
                <div className="visualizer-inspector__operation-label">
                  <span>Current operation</span>
                  <span className="visualizer-inspector__event" data-event={inspection.event}>
                    {inspection.event.replaceAll("_", " ")}
                  </span>
                </div>
                <h3>{inspectorOperationTitle}</h3>
                <p>{inspectorOperationDescription}</p>
              </div>
              <div className="visualizer-inspector__rows">
                {(binarySearchResultRows ?? inspectorRows).map((row) => (
                  <div className="visualizer-inspector__row" key={row.label}>
                    <strong>{row.label}</strong>
                    <p>{row.value}</p>
                  </div>
                ))}
              </div>
              <details className="visualizer-inspector__details">
                <summary>Expand explanation &amp; technical state</summary>
                <div className="visualizer-inspector__expanded">
                  <LearningPanels inspection={inspection} />
                </div>
              </details>
            </>
          ) : (
            <LabStatePanel
              state={inputRevision > 0 ? "loading" : "ready"}
              title={inputRevision > 0 ? "Preparing inspection" : "Waiting for execution"}
              description="Run the experiment to inspect the current operation, decision, and resulting state."
            />
          )}
        </aside>
      </div>

      <div className="visualizer-workspace__playback-panel">
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
      </div>

      {trace ? (
        <div className="visualizer-workspace__timeline-panel">
          <ExecutionTimeline
            steps={trace.steps}
            currentStep={step}
            searchMode={slug === "binary-search"}
            onSeek={(nextStep) => controllerRef.current?.setStep(nextStep)}
          />
        </div>
      ) : null}

      {visibility.showMetrics ? (
        <div className="visualizer-workspace__metrics-panel">
          <VisualizerMetricsBar
            step={
              slug === "binary-search" ? Math.max(0, completedBinarySearchComparisons - 1) : step
            }
            slug={slug}
            metrics={visualization?.metrics}
          />
        </div>
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

function WorkspaceTopicIcon({
  slug,
  visualizationType,
}: {
  slug: string;
  visualizationType: string;
}): React.JSX.Element {
  if (slug.includes("search")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg>
    );
  }
  if (visualizationType === "graph") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="19" r="2.5" />
        <circle cx="19" cy="19" r="2.5" />
        <path d="m10.8 7.2-4.5 9.5m6.9-9.5 4.5 9.5M7.5 19h9" />
      </svg>
    );
  }
  if (visualizationType === "tree") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="4" r="2.4" />
        <circle cx="5" cy="19" r="2.4" />
        <circle cx="19" cy="19" r="2.4" />
        <path d="M12 6.5v4.5M12 11H5v5.5m7-5.5h7v5.5" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 19V9m5 10V5m5 14v-7m5 7V3" />
    </svg>
  );
}

function WorkspacePanelIcon({
  kind,
}: {
  kind: "input" | "visualization" | "inspector";
}): React.JSX.Element {
  if (kind === "input") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16M7 12h10M10 18h4" />
        <circle cx="8" cy="6" r="2" fill="currentColor" />
        <circle cx="15" cy="12" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "visualization") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 20V13h4v7M10 20V8h4v12M16 20V4h4v16" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 5h16v14H4zM8 9h8M8 13h5" />
      <path d="m16 16 2 2 3-4" />
    </svg>
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
