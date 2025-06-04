/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  NONE = "NONE"
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

/**
 * Logger factory
 */
export class LoggerFactory {
  private static defaultLevel: LogLevel = LogLevel.INFO;
  
  static setLevel(level: LogLevel): void {
    this.defaultLevel = level;
  }
  
  static getLevel(): LogLevel {
    return this.defaultLevel;
  }
  
  static create(context?: string): Logger {
    return new ConsoleLogger(context, this.defaultLevel);
  }
}

/**
 * Console-based logger implementation
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
  
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return this.level !== LogLevel.NONE && 
           levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
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