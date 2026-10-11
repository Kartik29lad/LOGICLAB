"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/status";

export default function PublicError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div
      className="boundary-layout"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "50vh",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "34rem" }}>
        <ErrorState
          title="This learning view could not load"
          description="An unexpected error interrupted this module. Try again to reload."
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
