"use client";

export function Disclosure({
  title,
  description,
  children,
  defaultOpen = false,
  className = "",
}: Readonly<{
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}>): React.JSX.Element {
  return (
    <details className={`disclosure ${className}`.trim()} open={defaultOpen}>
      <summary>
        <span>
          <strong>{title}</strong>
          {description ? <small>{description}</small> : null}
        </span>
        <span aria-hidden="true">+</span>
      </summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}
