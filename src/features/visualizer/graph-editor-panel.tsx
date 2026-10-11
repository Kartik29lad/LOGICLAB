"use client";

import { useMemo, useState } from "react";

import type { GraphExperiment } from "./graph-editor";
import {
  cloneGraphExperiment,
  DEFAULT_GRAPH_EXPERIMENT,
  GRAPH_LIMITS,
  graphEdgeKey,
  nextNodeId,
  validateGraphExperiment,
} from "./graph-editor";

interface GraphEditorPanelProps {
  slug: string;
  graph: GraphExperiment;
  disabled?: boolean;
  onApply: (graph: GraphExperiment) => void;
}

export function GraphEditorPanel({
  slug,
  graph,
  disabled = false,
  onApply,
}: GraphEditorPanelProps): React.JSX.Element {
  const [draft, setDraft] = useState(() => cloneGraphExperiment(graph));
  const [nodeId, setNodeId] = useState("");
  const [source, setSource] = useState(graph.start);
  const [target, setTarget] = useState(
    graph.nodes.find((node) => node.id === graph.target)?.id ?? graph.nodes[1]?.id ?? graph.start
  );
  const [weight, setWeight] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const needsTarget = slug === "a-star";
  const isWeighted = slug === "dijkstra" || slug === "a-star";

  const nodeOptions = useMemo(
    () =>
      draft.nodes.map((node) => (
        <option key={node.id} value={node.id}>
          {node.label} ({node.id})
        </option>
      )),
    [draft.nodes]
  );
  const edgeSet = useMemo(
    () =>
      new Set(draft.edges.map((edge) => graphEdgeKey(edge.source, edge.target, draft.directed))),
    [draft]
  );

  const addNode = (): void => {
    const id = nodeId.trim() || nextNodeId(draft.nodes);
    const candidate = id.toUpperCase();
    if (draft.nodes.some((node) => node.id === candidate)) {
      setError(`Node '${candidate}' already exists.`);
      return;
    }
    if (draft.nodes.length >= GRAPH_LIMITS.nodes) {
      setError(`Graphs are limited to ${GRAPH_LIMITS.nodes} nodes.`);
      return;
    }
    const index = draft.nodes.length;
    const next = {
      ...draft,
      nodes: [
        ...draft.nodes,
        {
          id: candidate,
          label: candidate,
          x: 100 + (index % 4) * 170,
          y: 90 + Math.floor(index / 4) * 130,
        },
      ],
    };
    setDraft(next);
    setNodeId("");
    setError(null);
    onApply(next);
  };

  const addEdge = (): void => {
    if (!source || !target || source === target) {
      setError("Choose two different nodes for an edge.");
      return;
    }
    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight) || numericWeight < 0) {
      setError("Edge weight must be a finite non-negative number.");
      return;
    }
    if (edgeSet.has(graphEdgeKey(source, target, draft.directed))) {
      setError("That edge already exists.");
      return;
    }
    if (draft.edges.length >= GRAPH_LIMITS.edges) {
      setError(`Graphs are limited to ${GRAPH_LIMITS.edges} edges.`);
      return;
    }
    const next = { ...draft, edges: [...draft.edges, { source, target, weight: numericWeight }] };
    setDraft(next);
    setError(null);
    onApply(next);
  };

  const removeNode = (id: string): void => {
    if (draft.nodes.length <= 1) {
      setError("The graph must contain at least one node.");
      return;
    }
    const nodes = draft.nodes.filter((node) => node.id !== id);
    const edges = draft.edges.filter((edge) => edge.source !== id && edge.target !== id);
    const start = draft.start === id ? nodes[0]!.id : draft.start;
    const next = {
      ...draft,
      nodes,
      edges,
      start,
      target: draft.target === id ? nodes[0]?.id : draft.target,
    };
    setDraft(next);
    setSource(start);
    setTarget(next.target ?? start);
    setError(null);
    onApply(next);
  };

  const removeEdge = (sourceId: string, targetId: string): void => {
    const next = {
      ...draft,
      edges: draft.edges.filter((edge) => !(edge.source === sourceId && edge.target === targetId)),
    };
    setDraft(next);
    setError(null);
    onApply(next);
  };

  const changeMode = (directed: boolean): void => {
    const deduped = new Map<string, (typeof draft.edges)[number]>();
    draft.edges.forEach((edge) =>
      deduped.set(graphEdgeKey(edge.source, edge.target, directed), edge)
    );
    const next = { ...draft, directed, edges: [...deduped.values()] };
    setDraft(next);
    setError(null);
    onApply(next);
  };

  const applyControls = (): void => {
    const next = { ...draft, start: source, target: needsTarget ? target : draft.target };
    const validationError = validateGraphExperiment(next, slug);
    if (validationError) {
      setError(validationError);
      return;
    }
    setDraft(next);
    setError(null);
    onApply(next);
  };

  const reset = (): void => {
    const next = cloneGraphExperiment(DEFAULT_GRAPH_EXPERIMENT);
    setDraft(next);
    setSource(next.start);
    setTarget(next.target ?? next.start);
    setNodeId("");
    setError(null);
    onApply(next);
  };

  return (
    <section className="graph-editor-panel" aria-label="Graph editor">
      <div className="graph-editor-panel__header">
        <div>
          <p className="page-header__eyebrow">Interactive Graph Editor</p>
          <h2>Build your graph</h2>
          <p>
            Edit topology, weights, direction, and traversal endpoints without changing the
            algorithm engine.
          </p>
        </div>
        <span className="graph-editor-panel__limit">
          {draft.nodes.length}/{GRAPH_LIMITS.nodes} nodes · {draft.edges.length}/
          {GRAPH_LIMITS.edges} edges
        </span>
      </div>
      <div className="graph-editor-toolbar">
        <label>
          <span>Graph mode</span>
          <select
            value={draft.directed ? "directed" : "undirected"}
            disabled={disabled}
            onChange={(event) => changeMode(event.target.value === "directed")}
          >
            <option value="undirected">Undirected</option>
            <option value="directed">Directed</option>
          </select>
        </label>
        <label>
          <span>Start node</span>
          <select
            value={source}
            disabled={disabled}
            onChange={(event) => setSource(event.target.value)}
          >
            {nodeOptions}
          </select>
        </label>
        {needsTarget ? (
          <label>
            <span>Target node</span>
            <select
              value={target}
              disabled={disabled}
              onChange={(event) => setTarget(event.target.value)}
            >
              {nodeOptions}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          className="button button--primary"
          disabled={disabled}
          onClick={applyControls}
        >
          Apply graph
        </button>
        <button type="button" className="button" disabled={disabled} onClick={reset}>
          Reset graph
        </button>
      </div>
      <div className="graph-editor-grid">
        <div className="graph-editor-card">
          <h3>Add node</h3>
          <div className="graph-editor-inline">
            <input
              value={nodeId}
              disabled={disabled}
              onChange={(event) => setNodeId(event.target.value)}
              placeholder="Auto / A-Z"
              maxLength={12}
              aria-label="New node ID"
            />
            <button type="button" className="button" disabled={disabled} onClick={addNode}>
              Add node
            </button>
          </div>
        </div>
        <div className="graph-editor-card">
          <h3>Add edge</h3>
          <div className="graph-editor-inline">
            <select
              value={source}
              disabled={disabled}
              onChange={(event) => setSource(event.target.value)}
              aria-label="Edge source"
            >
              {nodeOptions}
            </select>
            <span aria-hidden="true">→</span>
            <select
              value={target}
              disabled={disabled}
              onChange={(event) => setTarget(event.target.value)}
              aria-label="Edge target"
            >
              {nodeOptions}
            </select>
            {isWeighted ? (
              <input
                value={weight}
                disabled={disabled}
                onChange={(event) => setWeight(event.target.value)}
                inputMode="decimal"
                aria-label="Edge weight"
              />
            ) : null}
            <button type="button" className="button" disabled={disabled} onClick={addEdge}>
              Add edge
            </button>
          </div>
        </div>
      </div>
      <div className="graph-editor-lists">
        <div>
          <h3>Nodes</h3>
          <div className="graph-editor-chips">
            {draft.nodes.map((node) => (
              <span key={node.id} className="graph-editor-chip">
                <strong>{node.label}</strong>
                <small>{node.id}</small>
                <button
                  type="button"
                  aria-label={`Delete node ${node.id}`}
                  disabled={disabled}
                  onClick={() => removeNode(node.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>Edges</h3>
          <div className="graph-editor-edges">
            {draft.edges.map((edge) => (
              <span
                key={`${edge.source}-${edge.target}-${edge.weight}`}
                className="graph-editor-edge-chip"
              >
                {edge.source} {draft.directed ? "→" : "↔"} {edge.target}
                {isWeighted ? ` · ${edge.weight}` : ""}
                <button
                  type="button"
                  aria-label={`Delete edge ${edge.source} to ${edge.target}`}
                  disabled={disabled}
                  onClick={() => removeEdge(edge.source, edge.target)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      {error ? (
        <p className="graph-editor-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
