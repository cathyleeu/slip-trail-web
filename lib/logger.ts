/**
 * Centralized logging utility
 * Provides environment-aware logging with different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Format log message with context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`
    }

    return `${prefix} ${message}`
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  /**
   * Log error messages
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails: LogContext = { ...context }

    if (error instanceof Error) {
      errorDetails.error = error.message
      errorDetails.stack = error.stack
    } else if (error) {
      errorDetails.error = String(error)
    }

    console.error(this.formatMessage('error', message, errorDetails))
  }

  /**
   * Log API errors with structured data
   */
  apiError(endpoint: string, error: unknown, additionalContext?: LogContext): void {
    const context: LogContext = {
      endpoint,
      ...additionalContext,
    }

    if (error instanceof Error) {
      context.errorMessage = error.message
      context.errorStack = error.stack
    } else {
      context.error = String(error)
    }

    this.error('API Error', error, context)
  }

  /**
   * Log database errors with structured data
   */
  dbError(operation: string, table: string, error: unknown, additionalContext?: LogContext): void {
    this.error('Database Error', error, {
      operation,
      table,
      ...additionalContext,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export utility functions for specific contexts
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    logger.error(message, error, context),
  apiError: (endpoint: string, error: unknown, context?: LogContext) =>
    logger.apiError(endpoint, error, context),
  dbError: (operation: string, table: string, error: unknown, context?: LogContext) =>
    logger.dbError(operation, table, error, context),
}
