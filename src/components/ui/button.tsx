import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <button className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Link className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>
      {children}
    </Link>
  );
}
