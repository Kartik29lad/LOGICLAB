export function Card({
  className = "",
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}
export function CardHeader({
  eyebrow,
  title,
  description,
}: Readonly<{ eyebrow?: string; title: string; description?: string }>) {
  return (
    <header className="card__header">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
