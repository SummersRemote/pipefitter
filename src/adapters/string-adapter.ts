/**
 * String adapter - Fluent builder pattern for better readability
 * 
 * Provides clean, readable string processing with static factory methods:
 * - StringAdapter.input(string) - Create input adapter
 * - StringAdapter.output(options) - Create output adapter  
 * - StringAdapter.console(prefix) - Create console adapter
 */

import { Adapter } from '../core/adapter';
import { Message } from '../core/message';

/**
 * Options for string adapter operations
 */
export interface StringAdapterOptions {
  /** Input string (for input operations) */
  input?: string;
  
  /** Output prefix (for output operations) */
  prefix?: string;
  
  /** Whether to log to console (for console operations) */
  console?: boolean;
  
  /** Text encoding (for future file operations) */
  encoding?: string;
}

/**
 * String processing adapter with fluent builder pattern
 */
export class StringAdapter implements Adapter {
  
  constructor(private options: StringAdapterOptions = {}) {}
  
  /**
   * Handle message processing based on configured options
   */
  handle(message: Message, runtimeOptions: StringAdapterOptions = {}): Message {
    // Merge constructor options with runtime options
    const mergedOptions = { ...this.options, ...runtimeOptions };
    const { input, prefix = '', console: logToConsole = false } = mergedOptions;
    
    // Input operation - set string as message data
    if (input !== undefined) {
      return {
        ...message,
        data: input,
        metadata: {
          ...message.metadata,
          data: { format: 'text/plain' },
          source: { type: 'string', length: input.length }
        }
      };
    }
    
    // Output operation - convert message data to string
    const stringData = this.convertToString(message.data);
    const outputString = prefix + stringData;
    
    // Log to console if requested
    if (logToConsole) {
      message.context.logger.info('String Output', outputString);
    }
    
    return {
      ...message,
      data: outputString,
      metadata: {
        ...message.metadata,
        data: { format: 'text/plain' },
        output: { type: 'string', length: outputString.length }
      }
    };
  }
  
  /**
   * Convert various data types to string representation
   */
  private convertToString(data: any): string {
    if (data === null || data === undefined) {
      return '';
    }
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
      return String(data);
    }
    
    if (Array.isArray(data) || typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  }
  
  // === STATIC FACTORY METHODS (Fluent Builder Pattern) ===
  
  /**
   * Create a string input adapter
   * 
   * @example
   * ```typescript
   * pipeline.from(StringAdapter.input('Hello World'))
   * ```
   */
  static input(text: string): StringAdapter {
    return new StringAdapter({ input: text });
  }
  
  /**
   * Create a string output adapter
   * 
   * @example
   * ```typescript
   * pipeline.to(StringAdapter.output())
   * pipeline.to(StringAdapter.output({ prefix: 'Result: ' }))
   * ```
   */
  static output(options: Omit<StringAdapterOptions, 'input'> = {}): StringAdapter {
    return new StringAdapter(options);
  }
  
  /**
   * Create a console output adapter
   * 
   * @example
   * ```typescript
   * pipeline.to(StringAdapter.console())
   * pipeline.to(StringAdapter.console('Debug: '))
   * ```
   */
  static console(prefix = ''): StringAdapter {
    return new StringAdapter({ prefix, console: true });
  }
}