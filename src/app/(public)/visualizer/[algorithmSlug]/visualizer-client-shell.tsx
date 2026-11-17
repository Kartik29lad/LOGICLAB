"use client";

import { useMemo } from "react";

import type { VisualizerRuntimePorts } from "@/contracts/visualization";
import { resolveAnimationIntent } from "@/core/visualization/motion/animation-intent";
import { PlaybackController } from "@/core/visualization/playback/playback-controller";
import { VisualizerWorkspace } from "@/features/visualizer/visualizer-workspace";

interface VisualizerClientShellProps {
  slug: string;
  title: string;
  visualizationType: string;
}

export function VisualizerClientShell({
  slug,
  title,
  visualizationType,
}: VisualizerClientShellProps): React.JSX.Element {
  const runtime = useMemo<VisualizerRuntimePorts>(
    () => ({
      createPlaybackController: (options) => new PlaybackController(options),
      resolveAnimationIntent,
    }),
    []
  );

  return (
    <VisualizerWorkspace
      slug={slug}
      title={title}
      visualizationType={visualizationType}
      runtime={runtime}
    />
  );
}
