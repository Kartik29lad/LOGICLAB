/**
 * Application constants, resource limits, and pedagogical bounds.
 */

export const APPLICATION_CONFIG = {
  identity: {
    name: "LogicLab",
    tagline: "Explore. Visualize. Understand.",
    version: "0.1.0",
    description: "Interactive algorithm and data-structure learning laboratory.",
  },
  limits: {
    // Array algorithm execution limits
    minArraySize: 2,
    maxArraySize: 100,
    defaultArraySize: 20,

    // Graph visualizer limits
    minGraphNodes: 2,
    maxGraphNodes: 50,
    maxGraphEdges: 120,

    // Animation & Playback controls
    minPlaybackSpeed: 0.25,
    maxPlaybackSpeed: 4.0,
    defaultPlaybackSpeed: 1.0,
    defaultStepDelayMs: 250,

    // Execution safety constraints
    maxExecutionSteps: 10_000,
    maxExecutionTimeMs: 5_000,
    maxCallStackDepth: 1_000,
  },
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;
