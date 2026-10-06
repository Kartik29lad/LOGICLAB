export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          padding: "3rem",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
          LogicLab
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--muted)",
            marginBottom: "2rem",
          }}
        >
          Explore. Visualize. Understand.
        </p>
        <div
          style={{
            padding: "1rem",
            borderRadius: "6px",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            fontSize: "0.875rem",
            color: "var(--foreground)",
          }}
        >
          <strong>Phase 1: Repository and Development Foundation</strong>
          <p style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
            Next.js App Router, TypeScript, and engineering tooling initialized.
          </p>
        </div>
      </div>
    </main>
  );
}
