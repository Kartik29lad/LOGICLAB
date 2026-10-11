import { parseEnvironment } from "../../config/env";
import { ValidationError } from "../../errors";

export function assertObject(
  value: unknown,
  message = "Request body must be a JSON object."
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new ValidationError(message);
  return value as Record<string, unknown>;
}

export function readString(
  body: Record<string, unknown>,
  field: string,
  options: { required?: boolean; maxLength?: number } = {}
): string | undefined {
  const value = body[field];
  if (value === undefined || value === null) {
    if (options.required) throw new ValidationError(`${field} is required.`);
    return undefined;
  }
  if (typeof value !== "string") throw new ValidationError(`${field} must be a string.`);
  const result = value.trim();
  if (options.required && !result) throw new ValidationError(`${field} is required.`);
  if (options.maxLength !== undefined && result.length > options.maxLength)
    throw new ValidationError(`${field} exceeds the maximum length.`);
  return result;
}

export function readFiniteNumber(
  body: Record<string, unknown>,
  field: string,
  options: { min?: number; max?: number; integer?: boolean; required?: boolean } = {}
): number | undefined {
  const value = body[field];
  if (value === undefined || value === null) {
    if (options.required) throw new ValidationError(`${field} is required.`);
    return undefined;
  }
  const result = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(result) || (options.integer && !Number.isInteger(result)))
    throw new ValidationError(`${field} must be a valid number.`);
  if (options.min !== undefined && result < options.min)
    throw new ValidationError(`${field} is below the minimum.`);
  if (options.max !== undefined && result > options.max)
    throw new ValidationError(`${field} exceeds the maximum.`);
  return result;
}

export function readStringArray(
  body: Record<string, unknown>,
  field: string,
  options: { min?: number; max?: number; itemMaxLength?: number } = {}
): string[] {
  const value = body[field];
  if (!Array.isArray(value)) throw new ValidationError(`${field} must be an array.`);
  if (options.min !== undefined && value.length < options.min)
    throw new ValidationError(`${field} requires at least ${options.min} items.`);
  if (options.max !== undefined && value.length > options.max)
    throw new ValidationError(`${field} allows at most ${options.max} items.`);
  return value.map((item) => {
    if (typeof item !== "string" || !item.trim())
      throw new ValidationError(`${field} must contain non-empty strings.`);
    const result = item.trim();
    if (options.itemMaxLength !== undefined && result.length > options.itemMaxLength)
      throw new ValidationError(`${field} contains an item that is too long.`);
    return result;
  });
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const maxBytes = parseEnvironment().limits.maxPayloadSizeBytes;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) throw new ValidationError("Request body is too large.");

  let raw: string;
  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > maxBytes) throw new ValidationError("Request body is too large.");
    raw = new TextDecoder().decode(buffer);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Request body could not be read.");
  }

  if (!raw.trim()) throw new ValidationError("Request body must contain valid JSON.");
  try {
    return assertObject(JSON.parse(raw));
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Request body must contain valid JSON.");
  }
}
