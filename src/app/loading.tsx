import { LoadingState } from "@/components/ui/status";

export default function Loading() {
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
      <LoadingState label="Loading LogicLab" />
    </div>
  );
}
