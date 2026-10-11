import { ValidationError } from "../../errors";

export function assertAllowedFields(
  body: Record<string, unknown>,
  allowed: readonly string[]
): void {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(body).filter((key) => !allowedSet.has(key));
  if (unknown.length > 0) throw new ValidationError(`Unexpected field: ${unknown[0]}.`);
}

export function readStrictBoolean(
  body: Record<string, unknown>,
  field: string,
  defaultValue = false
): boolean {
  const value = body[field];
  if (value === undefined) return defaultValue;
  if (typeof value !== "boolean") throw new ValidationError(`${field} must be a boolean.`);
  return value;
}
