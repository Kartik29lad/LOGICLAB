"use client";

import dynamic from "next/dynamic";

import type { VisualStateSnapshot } from "@/contracts/events/visualization-state";

import { VisualizationErrorBoundary } from "./visualization-error-boundary";

const ArrayRenderer = dynamic(
  () => import("./renderers/array-renderer").then((module) => module.ArrayRenderer),
  { loading: () => <RendererLoading /> }
);
const GraphRenderer = dynamic(
  () => import("./renderers/graph-renderer").then((module) => module.GraphRenderer),
  { loading: () => <RendererLoading /> }
);
const TreeRenderer = dynamic(
  () => import("./renderers/tree-renderer").then((module) => module.TreeRenderer),
  { loading: () => <RendererLoading /> }
);
const LinearRenderers = dynamic(
  () => import("./renderers/linear-renderers").then((module) => module.LinearRenderers),
  { loading: () => <RendererLoading /> }
);

export interface RendererRegistration<TState extends VisualStateSnapshot = VisualStateSnapshot> {
  readonly type: string;
  readonly displayName: string;
  readonly version: string;
  render(
    state: TState,
    context?: {
      speed?: number;
      reducedMotion?: boolean;
      animationIntent?: { type?: string } | null;
    }
  ): React.JSX.Element;
}

export interface VisualizationRenderOptions {
  speed?: number;
  reducedMotion?: boolean;
  animationIntent?: { type?: string } | null;
  graphEditor?: { enabled: boolean; onNodeMove?: (nodeId: string, x: number, y: number) => void };
  resetKey?: string | number;
}

export const RENDERER_REGISTRY: Readonly<Record<string, RendererRegistration>> = {
  array: {
    type: "array",
    displayName: "Array",
    version: "2.1",
    render: (state, context) => (
      <ArrayRenderer
        state={state as never}
        speed={context?.speed}
        reducedMotion={context?.reducedMotion}
        animationIntent={context?.animationIntent as never}
      />
    ),
  },
  graph: {
    type: "graph",
    displayName: "Graph",
    version: "2.1",
    render: (state, context) => (
      <GraphRenderer
        state={state as never}
        animationIntent={context?.animationIntent}
        reducedMotion={context?.reducedMotion}
      />
    ),
  },
  tree: {
    type: "tree",
    displayName: "Tree",
    version: "2.1",
    render: (state, context) => (
      <TreeRenderer
        state={state as never}
        animationIntent={context?.animationIntent as never}
        reducedMotion={context?.reducedMotion}
      />
    ),
  },
  stack: {
    type: "stack",
    displayName: "Stack",
    version: "2.1",
    render: (state) => <LinearRenderers kind="stack" state={state as never} />,
  },
  queue: {
    type: "queue",
    displayName: "Queue",
    version: "2.1",
    render: (state) => <LinearRenderers kind="queue" state={state as never} />,
  },
  "linked-list": {
    type: "linked-list",
    displayName: "Linked List",
    version: "2.1",
    render: (state) => <LinearRenderers kind="linked-list" state={state as never} />,
  },
  "hash-table": {
    type: "hash-table",
    displayName: "Hash Table",
    version: "2.1",
    render: (state) => <LinearRenderers kind="hash-table" state={state as never} />,
  },
  heap: {
    type: "heap",
    displayName: "Heap",
    version: "2.1",
    render: (state) => <LinearRenderers kind="heap" state={state as never} />,
  },
  grid: {
    type: "grid",
    displayName: "Grid",
    version: "2.1",
    render: (state) => <LinearRenderers kind="grid" state={state as never} />,
  },
};

export function getRenderer(type: string): RendererRegistration | undefined {
  return RENDERER_REGISTRY[type];
}

export function renderVisualization(
  state: VisualStateSnapshot,
  options: VisualizationRenderOptions = {}
): React.JSX.Element {
  const renderer = getRenderer(state.type);
  if (!renderer)
    return (
      <pre className="viz-generic" role="img" aria-label={`Visualization state for ${state.type}`}>
        {JSON.stringify(state, null, 2)}
      </pre>
    );
  return (
    <VisualizationErrorBoundary resetKey={options.resetKey ?? state.type}>
      {renderer.render(state, {
        speed: options.speed,
        reducedMotion: options.reducedMotion,
        animationIntent: options.animationIntent,
      })}
    </VisualizationErrorBoundary>
  );
}

function RendererLoading(): React.JSX.Element {
  return (
    <div className="viz-loading" role="status" aria-label="Loading visualization">
      Loading visualization…
    </div>
  );
}
