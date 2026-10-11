import * as React from "react";
import { useId } from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="select" {...props}>
      {children}
    </select>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: Readonly<{
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}>) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const child = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{
          id?: string;
          "aria-describedby"?: string;
          "aria-invalid"?: boolean;
        }>,
        {
          id: (children as React.ReactElement<{ id?: string }>).props.id ?? fieldId,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        }
      )
    : children;

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      {child}
      {hint && <small id={hintId}>{hint}</small>}
      {error && (
        <small id={errorId} className="field__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
