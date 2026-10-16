/**
 * Centralized logger utility for the application.
 *
 * Provides a consistent logging interface across all modules.
 * Can be extended to support multiple transports (file, external services, etc.)
 * in the future.
 *
 * Emits only warnings and errors suitable for production diagnostics.
 */

type LogLevel = "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

/**
 * Formats a log entry for console output.
 */
function formatLogEntry(entry: any): string {
  const levelUpper = entry.level.toUpperCase().padEnd(5);
  const timestamp = entry.timestamp;
  const context = entry.context ? ` [${entry.context}]` : "";
  const message = entry.message;

  return `${timestamp} ${levelUpper}${context} ${message}`;
}

/**
 * Gets the color code for the log level (for terminal output).
 */
function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };
  return colors[level];
}

/**
 * Main logger object with methods for each log level.
 */
export const logger = {
  /**
   * Warn level - warning messages for potentially problematic situations.
   * Reports potentially problematic situations.
   */
  warn(message: string, context?: string, data?: unknown): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: "warn" as const,
      message,
      context,
      data,
    };

    const color = getLevelColor("warn");
    const reset = "\x1b[0m";
    console.warn(`${color}${formatLogEntry(entry)}${reset}`, data || "");
  },

  /**
   * Error level - error messages for failures and exceptions.
   * Reports failures and exceptions.
   */
  error(message: string, context?: string, error?: unknown): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: "error" as const,
      message,
      context,
      data: error instanceof Error ? error.message : error,
    };

    const color = getLevelColor("error");
    const reset = "\x1b[0m";
    console.error(`${color}${formatLogEntry(entry)}${reset}`);

    // In development, also print the full error object
    if (process.env.NODE_ENV !== "production" && error) {
      console.error(color, error, reset);
    }
  },
};
