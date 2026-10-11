"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== "production")
      console.error("Visualization renderer failed", error, info.componentStack);
  }

  componentDidUpdate(previousProps: Props): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError)
      this.setState({ hasError: false });
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <section
        className="visualization-error-boundary"
        role="alert"
        aria-label="Visualization error"
      >
        <strong>Visualization temporarily unavailable</strong>
        <p>
          The execution trace is preserved. This visual surface failed independently and can be
          retried without rerunning the algorithm.
        </p>
        {this.state.message ? (
          <details>
            <summary>Technical detail</summary>
            <code>{this.state.message}</code>
          </details>
        ) : null}
      </section>
    );
  }
}
