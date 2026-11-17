"use client";

import { ArrayInputPanel } from "./array-input-panel";
import { DataStructureInputPanel } from "./data-structure-input-panel";
import type { GraphExperiment } from "./graph-editor";
import { GraphEditorPanel } from "./graph-editor-panel";
import { TreeExperimentPanel } from "./tree-experiment-panel";
import type { TreeExperiment } from "./tree-laboratory";

interface VisualizerInputSectionProps {
  slug: string;
  showInputs: boolean;
  disabled: boolean;
  isArrayVisualizer: boolean;
  isGraphVisualizer: boolean;
  isTreeVisualizer: boolean;
  isLinearStructure: boolean;
  graphExperiment: GraphExperiment;
  treeExperiment: TreeExperiment;
  graphError: string | null;
  onApplyArray: (values: number[], target?: number) => void;
  onApplyGraph: (graph: GraphExperiment) => void;
  onApplyTree: (tree: TreeExperiment) => void;
  onApplyLinear: (values: number[]) => void;
}

export function VisualizerInputSection({
  slug,
  showInputs,
  disabled,
  isArrayVisualizer,
  isGraphVisualizer,
  isTreeVisualizer,
  isLinearStructure,
  graphExperiment,
  treeExperiment,
  graphError,
  onApplyArray,
  onApplyGraph,
  onApplyTree,
  onApplyLinear,
}: VisualizerInputSectionProps): React.JSX.Element {
  return (
    <>
      {showInputs && isArrayVisualizer ? (
        <ArrayInputPanel key={slug} slug={slug} disabled={disabled} onApply={onApplyArray} />
      ) : null}
      {showInputs && isGraphVisualizer ? (
        <GraphEditorPanel
          key={slug}
          slug={slug}
          disabled={disabled}
          graph={graphExperiment}
          onApply={onApplyGraph}
        />
      ) : null}
      {showInputs && isTreeVisualizer ? (
        <TreeExperimentPanel
          key={slug}
          value={treeExperiment}
          disabled={disabled}
          onApply={onApplyTree}
        />
      ) : null}
      {showInputs && isLinearStructure ? (
        <DataStructureInputPanel
          key={slug}
          slug={slug as "stack" | "queue" | "linked-list" | "hash-table" | "heap"}
          disabled={disabled}
          onApply={onApplyLinear}
        />
      ) : null}
      {graphError ? (
        <div className="visualizer-error-banner" role="alert">
          {graphError}
        </div>
      ) : null}
    </>
  );
}
