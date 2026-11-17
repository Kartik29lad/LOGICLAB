# LogicLab Animation System Architecture

## Layer Ownership

| Layer                                                                     | Responsibility                                                                                                                                      | Disallowed Imports                                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/contracts/visualization/`                                            | Pure `PlaybackPort`, `AnimationIntent`, `ChoreographyOperation`, `MotionHandle`, and `MOTION_TIMING_TOKENS`                                         | React, GSAP, DOM, `@/core`, `@/features`                                           |
| `src/core/visualization/`                                                 | Canonical trace execution, `PlaybackController`, `resolveAnimationIntent`, pure transition planning                                                 | React, GSAP, DOM, `@/features`, `@/app`                                            |
| `src/app/(public)/visualizer/[algorithmSlug]/visualizer-client-shell.tsx` | Composition root injecting `PlaybackController` and `resolveAnimationIntent` into `VisualizerWorkspace`                                             | —                                                                                  |
| `src/features/visualizer/motion/`                                         | `GsapMotionEngine`, `VisualizerElementRegistry`, `StepPresentationCoordinator`, `MotionCoordinatorProvider`, SVG geometry adapter, and GSAP presets | `@/core`, `@/server`                                                               |
| `src/features/visualizer/renderers/`                                      | React DOM/SVG structure, stable logical element keys, `useStepMotionLayout` choreography wiring                                                     | `@/core`, `@/server`                                                               |
| `src/styles/`                                                             | Static layout, semantic colors, and non-GSAP visual styling                                                                                         | Competing `transform` transitions or CSS keyframes on `[data-motion-owned="gsap"]` |

## Playback & Presentation Lifecycle

1. `PlaybackController` invokes `onStep(stepIndex, { stepIndex, mode, generation })` and awaits its `Promise`.
2. `StepPresentationCoordinator.beginStepTransition()` captures pre-commit element bounding rects (`prevRects`) while the previous step is still settled on screen, then triggers the React step commit.
3. Each renderer registers elements by stable logical ID in `VisualizerElementRegistry` and runs `useStepMotionLayout()`, which synchronously executes in `useLayoutEffect` before browser paint to apply FLIP offsets and start the GSAP timeline.
4. `pause()` pauses the active GSAP timeline in place (`onAnimationPause`) without cancelling; `resume()` continues (`onAnimationResume`); `setSpeed()` updates `timeScale` in flight (`onSpeedChange`); `previous()`, `setStep()` (seek), and `restart()` cancel active timelines and commit `mode: "settle"`.
5. Every `MotionHandle` resolves cleanly on completion, cancellation, reduced motion, readiness timeout, or caught error so playback never stalls in `ANIMATING`.

## Stable Element Identity

- **Arrays**: `deriveStableElementIds()` tracks elements across `SWAP` and `SET_CURRENT` + `WRITE` insertion shifts. `resolveTargetIds()` maps event slots through the current `ArrayVisualState.elements[slot].id`.
- **Stack / Queue / Heap**: `itemEntries` carry monotonic creation IDs (`stack-item-*`, `queue-item-*`, `heap-item-*`) through pushes, pops, enqueues, dequeues, and heap swaps.
- **Trees**: `snapshotTree()` keys BST nodes by `tree-node-${value}`, and `buildTreeStepTimeline()` interpolates both node `transform` and edge `x1/y1/x2/y2` from one shared proxy progress tick.
- **Graphs**: Edges carry stable `edge:${source}->${target}` IDs (with `#occurrence` for parallel edges), `<marker>` IDs use `useId()`, and `buildGraphStepTimeline()` animates `strokeDashoffset` + path-following tracer via `SvgGeometryPort`.

## Accessibility, Performance & Rollback

- **Reduced motion**: `useReducedMotion()` observes both `matchMedia("(prefers-reduced-motion: reduce)")` and `document.documentElement.dataset.reducedMotion`; GSAP timelines are bypassed and canonical state settles immediately while preserving code sync, counters, and ARIA announcements.
- **Large traces**: `shouldBypassMotionForLargeTrace()` (`steps > 250` or `input > 60`) switches steps to `mode: "settle"` automatically.
- **Rollback**: Each renderer (`array`, `graph`, `tree`, `linear/*`) consumes the shared coordinator independently and can be reverted to instant canonical state by returning `null` from its preset builder without affecting canonical execution traces or other renderers.
