import Link from "next/link";

import { EmptyState } from "@/components/ui/status";

export default function NotFound() {
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
        <EmptyState
          title="Page not found"
          description="The requested LogicLab destination does not exist or has been moved."
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-6)",
          }}
        >
          <Link className="button button--primary" href="/">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
