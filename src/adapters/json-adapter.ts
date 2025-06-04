/**
 * JSON adapter - Fluent builder pattern for better readability
 * 
 * Provides clean, readable JSON processing with static factory methods:
 * - JsonAdapter.parse(string) - Parse JSON string
 * - JsonAdapter.from(object) - Use object directly
 * - JsonAdapter.output(options) - JSON output with formatting
 * - JsonAdapter.pretty(indent) - Pretty-printed JSON output
 * - JsonAdapter.console() - Console JSON output
 */

import { Adapter } from '../core/adapter';
import { Message } from '../core/message';

/**
 * Options for JSON adapter operations
 */
export interface JsonAdapterOptions {
  /** JSON input (string to parse or object to use directly) */
  input?: string | object;
  
  /** Pretty-print output with indentation */
  pretty?: boolean;
  
  /** Indentation spaces for pretty printing */
  indent?: number;
  
  /** Whether to validate JSON structure */
  validate?: boolean;
  
  /** Include metadata in output */
  includeMetadata?: boolean;
  
  /** Log output to console */
  console?: boolean;
}

/**
 * JSON processing adapter with fluent builder pattern
 */
export class JsonAdapter implements Adapter {
  
  constructor(private options: JsonAdapterOptions = {}) {}
  
  /**
   * Handle JSON message processing
   */
  handle(message: Message, runtimeOptions: JsonAdapterOptions = {}): Message {
    // Merge constructor options with runtime options
    const mergedOptions = { ...this.options, ...runtimeOptions };
    const { 
      input, 
      pretty = false, 
      indent = 2, 
      validate = true,
      includeMetadata = false,
      console: logToConsole = false 
    } = mergedOptions;
    
    // Input operation - parse or accept JSON
    if (input !== undefined) {
      return this.handleInput(message, input, validate);
    }
    
    // Output operation - serialize to JSON
    return this.handleOutput(message, { pretty, indent, includeMetadata, logToConsole });
  }
  
  /**
   * Handle JSON input processing
   */
  private handleInput(message: Message, input: string | object, validate: boolean): Message {
    let jsonData: any;
    let sourceInfo: any = { type: 'json' };
    
    if (typeof input === 'string') {
      // Parse JSON string
      try {
        jsonData = JSON.parse(input);
        sourceInfo.inputType = 'string';
        sourceInfo.length = input.length;
      } catch (error) {
        if (validate) {
          throw new Error(`Invalid JSON string: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Use raw string if validation disabled
        jsonData = input;
        sourceInfo.parseError = true;
      }
    } else {
      // Use object directly
      jsonData = input;
      sourceInfo.inputType = 'object';
    }
    
    return {
      ...message,
      data: jsonData,
      metadata: {
        ...message.metadata,
        data: { format: 'application/json' },
        source: sourceInfo
      }
    };
  }
  
  /**
   * Handle JSON output processing
   */
  private handleOutput(
    message: Message, 
    options: { pretty: boolean; indent: number; includeMetadata: boolean; logToConsole: boolean }
  ): Message {
    const { pretty, indent, includeMetadata, logToConsole } = options;
    
    // Prepare data for serialization
    let outputData = message.data;
    
    if (includeMetadata) {
      outputData = {
        data: message.data,
        metadata: message.metadata
      };
    }
    
    // Serialize to JSON string
    const jsonString = pretty 
      ? JSON.stringify(outputData, null, indent)
      : JSON.stringify(outputData);
    
    // Log to console if requested
    if (logToConsole) {
      message.context.logger.info('JSON Output', jsonString);
    }
    
    return {
      ...message,
      data: jsonString,
      metadata: {
        ...message.metadata,
        data: { format: 'application/json' },
        output: { 
          type: 'json', 
          length: jsonString.length,
          pretty,
          includeMetadata
        }
      }
    };
  }
  
  // === STATIC FACTORY METHODS (Fluent Builder Pattern) ===
  
  /**
   * Create a JSON input adapter from string
   * 
   * @example
   * ```typescript
   * pipeline.from(JsonAdapter.parse('{"name": "John"}'))
   * pipeline.from(JsonAdapter.parse(jsonString, false)) // disable validation
   * ```
   */
  static parse(jsonString: string, validate = true): JsonAdapter {
    return new JsonAdapter({ input: jsonString, validate });
  }
  
  /**
   * Create a JSON input adapter from object
   * 
   * @example
   * ```typescript
   * pipeline.from(JsonAdapter.from({ name: 'John', age: 30 }))
   * ```
   */
  static from(jsonObject: object): JsonAdapter {
    return new JsonAdapter({ input: jsonObject });
  }
  
  /**
   * Create a JSON output adapter
   * 
   * @example
   * ```typescript
   * pipeline.to(JsonAdapter.output())
   * pipeline.to(JsonAdapter.output({ includeMetadata: true }))
   * ```
   */
  static output(options: Omit<JsonAdapterOptions, 'input'> = {}): JsonAdapter {
    return new JsonAdapter(options);
  }
  
  /**
   * Create a pretty-printed JSON output adapter
   * 
   * @example
   * ```typescript
   * pipeline.to(JsonAdapter.pretty())
   * pipeline.to(JsonAdapter.pretty(4)) // 4-space indentation
   * ```
   */
  static pretty(indent = 2): JsonAdapter {
    return new JsonAdapter({ pretty: true, indent });
  }
  
  /**
   * Create a console JSON output adapter
   * 
   * @example
   * ```typescript
   * pipeline.to(JsonAdapter.console())
   * pipeline.to(JsonAdapter.console(true)) // pretty-printed to console
   * ```
   */
  static console(pretty = true): JsonAdapter {
    return new JsonAdapter({ pretty, console: true });
  }
}