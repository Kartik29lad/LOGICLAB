"use client";

import { useEffect, useState } from "react";

export function isReducedMotionActive(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (document.documentElement.dataset.reducedMotion === "true") return true;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const update = (): void => setReduced(isReducedMotionActive());
    update();

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const onMediaChange = (): void => update();
    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", onMediaChange);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(onMediaChange);
      }
    }

    const observer =
      typeof MutationObserver === "function" ? new MutationObserver(() => update()) : null;
    observer?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reduced-motion"],
    });

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", onMediaChange);
        } else if (typeof mediaQuery.removeListener === "function") {
          mediaQuery.removeListener(onMediaChange);
        }
      }
      observer?.disconnect();
    };
  }, []);

  return reduced;
}
