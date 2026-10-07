import { APPLICATION_CONFIG } from "../../../config/application";

export interface ArrayValidationOptions {
  minSize?: number;
  maxSize?: number;
  minValue?: number;
  maxValue?: number;
  allowEmpty?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ArrayValidator {
  public static validate(
    array: readonly number[],
    options: ArrayValidationOptions = {}
  ): ValidationResult {
    const minSize = options.minSize ?? APPLICATION_CONFIG.limits.minArraySize;
    const maxSize = options.maxSize ?? APPLICATION_CONFIG.limits.maxArraySize;
    const allowEmpty = options.allowEmpty ?? false;

    if (array.length === 0) {
      if (allowEmpty) return { isValid: true };
      return { isValid: false, error: `Array cannot be empty. Minimum size is ${minSize}.` };
    }

    if (array.length < minSize) {
      return {
        isValid: false,
        error: `Array length (${array.length}) is below minimum limit of ${minSize}.`,
      };
    }

    if (array.length > maxSize) {
      return {
        isValid: false,
        error: `Array length (${array.length}) exceeds maximum limit of ${maxSize}.`,
      };
    }

    for (let i = 0; i < array.length; i++) {
      const val = array[i]!;
      if (!isFinite(val) || isNaN(val)) {
        return { isValid: false, error: `Element at index ${i} is not a valid finite number.` };
      }

      if (options.minValue !== undefined && val < options.minValue) {
        return {
          isValid: false,
          error: `Element ${val} at index ${i} is less than minimum value ${options.minValue}.`,
        };
      }

      if (options.maxValue !== undefined && val > options.maxValue) {
        return {
          isValid: false,
          error: `Element ${val} at index ${i} exceeds maximum value ${options.maxValue}.`,
        };
      }
    }

    return { isValid: true };
  }
}
