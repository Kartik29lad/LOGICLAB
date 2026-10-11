export class ExecutionEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExecutionEngineError";
  }
}

export class ExecutionBudgetExceededError extends ExecutionEngineError {
  constructor(message: string) {
    super(message);
    this.name = "ExecutionBudgetExceededError";
  }
}

export class ExecutionCancelledError extends ExecutionEngineError {
  constructor(message = "Execution was cancelled.") {
    super(message);
    this.name = "ExecutionCancelledError";
  }
}

export class ExecutionStateError extends ExecutionEngineError {
  constructor(message: string) {
    super(message);
    this.name = "ExecutionStateError";
  }
}
