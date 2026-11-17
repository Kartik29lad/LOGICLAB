import type { MotionTimeline } from "../gsap-motion-engine";
import type { SwapArcProfile } from "./array-presets";

export function addFlipArcTweens(
  tl: MotionTimeline,
  arcs: readonly SwapArcProfile[],
  elements: ReadonlyMap<string, Element>,
  durationSec: number
): void {
  for (const arc of arcs) {
    const el = elements.get(arc.id);
    if (!el) continue;
    tl.fromTo(
      el,
      { x: arc.dx, y: arc.dy, zIndex: 2 },
      { x: 0, y: 0, zIndex: 1, duration: durationSec, ease: "power2.inOut" },
      0
    );
    if (arc.peakYOffset !== 0) {
      tl.to(
        el,
        {
          y: arc.peakYOffset,
          duration: durationSec * 0.5,
          ease: "sine.out",
          yoyo: true,
          repeat: 1,
        },
        0
      );
    }
  }
}
