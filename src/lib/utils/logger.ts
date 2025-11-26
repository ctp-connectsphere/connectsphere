/**
 * Centralized logging utility for ConnectSphere
 * Provides structured logging with different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment =
      (process.env.NODE_ENV as string) === 'development' ||
      !process.env.NODE_ENV;
    this.isProduction = (process.env.NODE_ENV as string) === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? {
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            }
          : { error }),
      };
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  // Convenience methods that match console.log patterns
  log(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[${new Date().toISOString()}] [INFO]`, message, ...args);
    }
  }

  // For success messages (info level with visual indicator)
  success(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(`✅ ${this.formatMessage('info', message, context)}`);
    }
  }

  // For failure messages (error level with visual indicator)
  failure(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    this.error(`❌ ${message}`, error, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for testing
export { Logger };
export type { LogLevel, LogContext };
