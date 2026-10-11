"use client";

import { useEffect, useState } from "react";

import type { TreeExperiment } from "./tree-laboratory";

export function TreeExperimentPanel({
  value,
  disabled,
  onApply,
}: {
  value: TreeExperiment;
  disabled: boolean;
  onApply: (value: TreeExperiment) => void;
}): React.JSX.Element {
  const [values, setValues] = useState(value.values.join(", "));
  const [target, setTarget] = useState(String(value.target));
  const [operation, setOperation] = useState<TreeExperiment["operation"]>(value.operation);

  useEffect(() => {
    setValues(value.values.join(", "));
    setTarget(String(value.target));
    setOperation(value.operation);
  }, [value]);

  const apply = (): void => {
    const parsed = values
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number);
    if (parsed.length === 0 || parsed.some((n) => !Number.isFinite(n)) || parsed.length > 30)
      return;
    const nextTarget = Number(target);
    if (!Number.isFinite(nextTarget)) return;
    onApply({ values: parsed, operation, target: nextTarget });
  };

  return (
    <section className="tree-experiment-panel" aria-label="Binary search tree controls">
      <div>
        <strong>Tree Laboratory</strong>
        <span>Build, search, insert, or delete</span>
      </div>
      <label>
        Values
        <input value={values} disabled={disabled} onChange={(e) => setValues(e.target.value)} />
      </label>
      <label>
        Operation
        <select
          value={operation}
          disabled={disabled}
          onChange={(e) => setOperation(e.target.value as TreeExperiment["operation"])}
        >
          <option value="search">Search</option>
          <option value="insert">Insert</option>
          <option value="delete">Delete</option>
        </select>
      </label>
      <label>
        Target
        <input
          type="number"
          value={target}
          disabled={disabled}
          onChange={(e) => setTarget(e.target.value)}
        />
      </label>
      <button type="button" disabled={disabled} onClick={apply}>
        Run operation
      </button>
    </section>
  );
}
