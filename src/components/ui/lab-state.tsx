import type { ReactNode } from "react";

export type LabState = "empty" | "ready" | "loading" | "error" | "success";

export function LabStatePanel({
  state,
  title,
  description,
  action,
}: {
  state: LabState;
  title: string;
  description: string;
  action?: ReactNode;
}): React.JSX.Element {
  return (
    <section
      className={`lab-state lab-state--${state}`}
      data-state={state}
      aria-live={state === "loading" ? "polite" : undefined}
      role={state === "error" ? "alert" : undefined}
    >
      <div className="lab-state__indicator" aria-hidden="true">
        {state === "loading" ? "…" : state === "success" ? "✓" : state === "error" ? "!" : "◇"}
      </div>
      <div>
        <p className="lab-state__label">{state}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        {action ? <div className="lab-state__action">{action}</div> : null}
      </div>
    </section>
  );
}
