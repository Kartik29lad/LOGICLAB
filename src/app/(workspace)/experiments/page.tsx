import { ExperimentWorkspace } from "../../../features/experiments/experiment-workspace";

export default function Page() {
  return (
    <>
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">LogicLab</span>
          <h1>Experiments</h1>
          <p>Run reproducible what-if experiments against validated algorithm executions.</p>
        </div>
      </header>
      <ExperimentWorkspace />
    </>
  );
}
