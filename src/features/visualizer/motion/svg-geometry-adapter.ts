import type { MotionPoint } from "@/contracts/visualization";

export interface SvgGeometryPort {
  getTotalLength(element: SVGElement): number;
  getPointAtLength(element: SVGElement, distance: number): MotionPoint;
}

const LINE_PATH_PATTERN = /^\s*M\s*([-\d.]+)[,\s]+([-\d.]+)\s+L\s*([-\d.]+)[,\s]+([-\d.]+)/i;

function parseEndpoints(element: SVGElement): { start: MotionPoint; end: MotionPoint } | null {
  const d = element.getAttribute?.("d");
  if (d) {
    const match = LINE_PATH_PATTERN.exec(d);
    if (match) {
      return {
        start: { x: Number(match[1]), y: Number(match[2]) },
        end: { x: Number(match[3]), y: Number(match[4]) },
      };
    }
  }

  const x1 = Number(element.getAttribute?.("x1"));
  const y1 = Number(element.getAttribute?.("y1"));
  const x2 = Number(element.getAttribute?.("x2"));
  const y2 = Number(element.getAttribute?.("y2"));
  if ([x1, y1, x2, y2].every(Number.isFinite)) {
    return { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
  }
  return null;
}

export const defaultSvgGeometryAdapter: SvgGeometryPort = {
  getTotalLength(element: SVGElement): number {
    const candidate = element as unknown as { getTotalLength?: () => number };
    if (typeof candidate.getTotalLength === "function") {
      try {
        const len = candidate.getTotalLength();
        if (Number.isFinite(len) && len >= 0) return len;
      } catch {
        // Fall through to attribute parsing when detached or mocked.
      }
    }
    const endpoints = parseEndpoints(element);
    if (!endpoints) return 0;
    return Math.hypot(endpoints.end.x - endpoints.start.x, endpoints.end.y - endpoints.start.y);
  },

  getPointAtLength(element: SVGElement, distance: number): MotionPoint {
    const candidate = element as unknown as {
      getPointAtLength?: (d: number) => { x: number; y: number };
      getTotalLength?: () => number;
    };
    if (typeof candidate.getPointAtLength === "function") {
      try {
        const pt = candidate.getPointAtLength(distance);
        if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) return { x: pt.x, y: pt.y };
      } catch {
        // Fall through to attribute interpolation.
      }
    }
    const endpoints = parseEndpoints(element);
    if (!endpoints) return { x: 0, y: 0 };
    const total = Math.max(
      Math.hypot(endpoints.end.x - endpoints.start.x, endpoints.end.y - endpoints.start.y),
      1
    );
    const t = Math.max(0, Math.min(1, distance / total));
    return {
      x: endpoints.start.x + (endpoints.end.x - endpoints.start.x) * t,
      y: endpoints.start.y + (endpoints.end.y - endpoints.start.y) * t,
    };
  },
};
