import { LoadingState } from "@/components/ui/status";

export default function PublicLoading() {
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
      <LoadingState label="Loading learning space" />
    </div>
  );
}
