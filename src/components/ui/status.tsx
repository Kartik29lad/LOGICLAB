export function Badge({
  children,
  tone = "neutral",
}: Readonly<{
  children: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}>) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        ◇
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading" }: Readonly<{ label?: string }>) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Try again or return to the previous page.",
}: Readonly<{ title?: string; description?: string }>) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        !
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
