/**
 * Lightweight client-side logger.
 * Safe for use in browser components and visualizer hooks.
 */

export class ClientLogger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  public debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`[LogicLab:DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    console.info(`[LogicLab:INFO] ${message}`, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    console.warn(`[LogicLab:WARN] ${message}`, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    console.error(`[LogicLab:ERROR] ${message}`, ...args);
  }
}

export const clientLogger = new ClientLogger();
