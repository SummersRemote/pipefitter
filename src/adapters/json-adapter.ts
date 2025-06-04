// src/adapters/json-adapter.ts
import { InputAdapter, OutputAdapter } from '../core/adapter.js';
import { Message } from '../core/message.js';
import { FNode, FNodeType, createFNode, Primitive } from '../core/fnode.js';
import { createMessageFromFNode } from '../core/message.js';

/**
 * JSON adapter options
 */
export interface JsonAdapterOptions {
  pretty?: boolean;
  indent?: number;
  replacer?: (key: string, value: any) => any;
  reviver?: (key: string, value: any) => any;
}

/**
 * JSON input adapter - converts JSON data to FNode
 */
class JsonInputAdapter implements InputAdapter {
  constructor(
    private data: any,
    private options: JsonAdapterOptions = {}
  ) {}

  handle(message: Message): Message {
    const fnode = this.convertToFNode(this.data);
    return {
      ...message,
      data: fnode,
      metadata: {
        ...message.metadata,
        source: {
          format: 'application/json',
          adapter: 'JsonInputAdapter',
          processedAt: new Date().toISOString()
        }
      }
    };
  }

  private convertToFNode(data: any, name: string = 'root'): FNode {
    if (data === null) {
      return createFNode(FNodeType.VALUE, name, null);
    }

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return createFNode(FNodeType.VALUE, name, data as Primitive);
    }

    if (Array.isArray(data)) {
      const children = data.map((item, index) => 
        this.convertToFNode(item, index.toString())
      );
      return {
        type: FNodeType.COLLECTION,
        name,
        children
      };
    }

    if (typeof data === 'object') {
      const children = Object.entries(data).map(([key, value]) =>
        this.convertToFNode(value, key)
      );
      return {
        type: FNodeType.RECORD,
        name,
        children
      };
    }

    return createFNode(FNodeType.VALUE, name, String(data));
  }
}

/**
 * JSON output adapter - converts FNode to JSON data
 */
class JsonOutputAdapter implements OutputAdapter {
  constructor(private options: JsonAdapterOptions = {}) {}

  handle(message: Message): any {
    const result = this.convertFromFNode(message.data);
    
    if (this.options.pretty) {
      return JSON.stringify(result, this.options.replacer, this.options.indent || 2);
    }
    
    return result;
  }

  private convertFromFNode(node: FNode): any {
    // Handle primitive values
    if (node.type === FNodeType.VALUE) {
      return node.value;
    }

    // Handle collections (arrays)
    if (node.type === FNodeType.COLLECTION) {
      if (!node.children) return [];
      return node.children.map(child => this.convertFromFNode(child));
    }

    // Handle records (objects)
    if (node.type === FNodeType.RECORD) {
      if (!node.children) return {};
      const obj: Record<string, any> = {};
      
      for (const child of node.children) {
        obj[child.name] = this.convertFromFNode(child);
      }
      
      return obj;
    }

    // Handle fields (object properties)
    if (node.type === FNodeType.FIELD) {
      if (node.children && node.children.length > 0) {
        return this.convertFromFNode(node.children[0]);
      }
      return node.value;
    }

    // Default case
    return node.value;
  }
}

/**
 * JSON string input adapter
 */
class JsonStringInputAdapter implements InputAdapter {
  constructor(
    private jsonString: string,
    private options: JsonAdapterOptions = {}
  ) {}

  handle(message: Message): Message {
    try {
      const parsed = JSON.parse(this.jsonString, this.options.reviver);
      const inputAdapter = new JsonInputAdapter(parsed, this.options);
      return inputAdapter.handle(message);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * JSON string output adapter
 */
class JsonStringOutputAdapter implements OutputAdapter {
  constructor(private options: JsonAdapterOptions = {}) {}

  handle(message: Message): string {
    const outputAdapter = new JsonOutputAdapter(this.options);
    const result = outputAdapter.handle(message);
    
    if (typeof result === 'string') {
      return result; // Already stringified by pretty option
    }
    
    return JSON.stringify(result, this.options.replacer, this.options.indent);
  }
}

/**
 * Main JsonAdapter class with static factory methods
 */
export class JsonAdapter {
  /**
   * Create input adapter from JavaScript object
   */
  static object(data: any, options?: JsonAdapterOptions): InputAdapter {
    return new JsonInputAdapter(data, options);
  }

  /**
   * Create input adapter from JSON string
   */
  static string(jsonString: string, options?: JsonAdapterOptions): InputAdapter {
    return new JsonStringInputAdapter(jsonString, options);
  }

  /**
   * Create output adapter that returns JavaScript object
   */
  static output(options?: JsonAdapterOptions): OutputAdapter {
    return new JsonOutputAdapter(options);
  }

  /**
   * Create output adapter that returns JSON string
   */
  static stringify(options?: JsonAdapterOptions): OutputAdapter {
    return new JsonStringOutputAdapter(options);
  }

  /**
   * Create output adapter that returns pretty-formatted JSON string
   */
  static pretty(indent?: number): OutputAdapter {
    return new JsonStringOutputAdapter({ 
      pretty: true, 
      indent: indent || 2 
    });
  }

  /**
   * Create input adapter with custom reviver function
   */
  static parse(jsonString: string, reviver?: (key: string, value: any) => any): InputAdapter {
    return new JsonStringInputAdapter(jsonString, { reviver });
  }

  /**
   * Create output adapter with custom replacer function
   */
  static serialize(replacer?: (key: string, value: any) => any, space?: number): OutputAdapter {
    return new JsonStringOutputAdapter({ 
      replacer, 
      indent: space,
      pretty: space !== undefined 
    });
  }
}