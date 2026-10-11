export class InputNormalizationError extends Error {
  public readonly code = "INPUT_NORMALIZATION_FAILED";

  constructor(message: string) {
    super(message);
    this.name = "InputNormalizationError";
  }
}
