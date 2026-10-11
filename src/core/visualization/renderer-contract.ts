import type {
  VisualizationType,
  VisualStateSnapshot,
} from "../../contracts/events/visualization-state";
import type { AnimationIntent } from "./motion";

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export interface VisualizationRendererContext {
  readonly reducedMotion?: boolean;
  readonly speed?: number;
  readonly animationIntent?: AnimationIntent | null;
}

export interface VisualizationRenderer<TState extends VisualStateSnapshot = VisualStateSnapshot> {
  readonly type: TState["type"];
  readonly supportedStates?: readonly string[];
  render(state: DeepReadonly<TState>, context?: VisualizationRendererContext): React.JSX.Element;
}

export interface RendererRegistration<TState extends VisualStateSnapshot = VisualStateSnapshot> {
  readonly type: VisualizationType;
  readonly displayName: string;
  readonly version: string;
  readonly render: (
    state: DeepReadonly<TState>,
    context?: VisualizationRendererContext
  ) => React.JSX.Element;
}
