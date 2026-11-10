type LogLevel = "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

/** Formats the timestamp, severity, and optional context for a log line. */
function formatLogEntry(entry: LogEntry): string {
  const levelUpper = entry.level.toUpperCase().padEnd(5);
  const timestamp = entry.timestamp;
  const context = entry.context ? ` [${entry.context}]` : "";
  const message = entry.message;

  return `${timestamp} ${levelUpper}${context} ${message}`;
}

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    warn: "\x1b[33m",
    error: "\x1b[31m",
  };
  return colors[level];
}

export const logger = {
  /** Logs a warning with optional context and details. */
  warn(message: string, context?: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      ...(context === undefined ? {} : { context }),
      ...(data === undefined ? {} : { data }),
    };

    const color = getLevelColor("warn");
    const reset = "\x1b[0m";
    console.warn(`${color}${formatLogEntry(entry)}${reset}`, data || "");
  },

  /** Logs an error and includes its full details outside production. */
  error(message: string, context?: string, error?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      ...(context === undefined ? {} : { context }),
      ...(error === undefined
        ? {}
        : { data: error instanceof Error ? error.message : error }),
    };

    const color = getLevelColor("error");
    const reset = "\x1b[0m";
    console.error(`${color}${formatLogEntry(entry)}${reset}`);

    if (process.env.NODE_ENV !== "production" && error) {
      console.error(color, error, reset);
    }
  },
};
