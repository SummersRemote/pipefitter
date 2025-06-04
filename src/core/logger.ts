/**
 * Logger interface and implementation
 * 
 * Provides a simple, replaceable logging interface similar to XJX.
 * The default implementation logs to console, but can be replaced
 * with more robust logging solutions (Winston, Pino, etc.).
 */

/**
 * Log levels supported by the logger
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN", 
  ERROR = "ERROR",
  NONE = "NONE"
}

/**
 * Logger interface - can be implemented by any logging library
 */
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

/**
 * Logger factory for creating logger instances
 */
export class LoggerFactory {
  private static defaultLevel: LogLevel = LogLevel.INFO;
  
  /**
   * Set the global default log level
   */
  static setLevel(level: LogLevel): void {
    this.defaultLevel = level;
  }
  
  /**
   * Get the current default log level
   */
  static getLevel(): LogLevel {
    return this.defaultLevel;
  }
  
  /**
   * Create a new logger instance
   */
  static create(context?: string): Logger {
    return new ConsoleLogger(context, this.defaultLevel);
  }
}

/**
 * Default console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(
    private context: string = "",
    private level: LogLevel = LogLevel.INFO
  ) {}
  
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log("DEBUG", message, data);
    }
  }
  
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log("INFO", message, data);
    }
  }
  
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log("WARN", message, data);
    }
  }
  
  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log("ERROR", message, data);
    }
  }
  
  /**
   * Check if a message should be logged based on current level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return this.level !== LogLevel.NONE && 
           levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  /**
   * Internal logging method
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}]${this.context ? ` [${this.context}]` : ""} [${level}] ${message}`;
    
    if (data !== undefined) {
      console.log(prefix, data);
    } else {
      console.log(prefix);
    }
  }
}