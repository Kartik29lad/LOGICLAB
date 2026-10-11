import { useState } from "react";

import type { GraphExperiment } from "./graph-editor";
import { cloneGraphExperiment, DEFAULT_GRAPH_EXPERIMENT } from "./graph-editor";
import type { TreeExperiment } from "./tree-laboratory";
import { cloneTreeExperiment, DEFAULT_TREE_EXPERIMENT } from "./tree-laboratory";

export function useVisualizerInputState() {
  const [arrayInput, setArrayInput] = useState<number[]>([]);
  const [searchTarget, setSearchTarget] = useState<number | undefined>();
  const [graphExperiment, setGraphExperiment] = useState<GraphExperiment>(() =>
    cloneGraphExperiment(DEFAULT_GRAPH_EXPERIMENT)
  );
  const [treeExperiment, setTreeExperiment] = useState<TreeExperiment>(() =>
    cloneTreeExperiment(DEFAULT_TREE_EXPERIMENT)
  );
  const [linearInput, setLinearInput] = useState<number[]>([10, 20, 30, 40]);
  return {
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
  };
}

export function useVisualizerInteractionState() {
  const [predictionMode, setPredictionMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  return {
    predictionMode,
    setPredictionMode,
    focusMode,
    setFocusMode,
    presentationMode,
    setPresentationMode,
    fullscreen,
    setFullscreen,
  };
}
