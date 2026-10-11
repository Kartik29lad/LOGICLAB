"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/status";

export default function GlobalError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div
      className="boundary-layout"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "60vh",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "36rem" }}>
        <ErrorState
          title="LogicLab could not load this view"
          description="The learning experience hit an unexpected error. Try again to resume your session."
        />
        {error?.digest ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "var(--text-caption)",
              color: "var(--color-text-subtle)",
              marginTop: "var(--space-3)",
              fontFamily: "var(--font-code)",
            }}
          >
            Digest: {error.digest}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-6)",
          }}
        >
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
