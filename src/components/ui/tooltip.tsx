import { useId } from "react";

export function Tooltip({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  const id = `tooltip-${useId()}`;
  return (
    <span className="tooltip">
      <span className="tooltip__target" aria-describedby={id}>
        {children}
      </span>
      <span id={id} className="tooltip__content" role="tooltip">
        {label}
      </span>
    </span>
  );
}
