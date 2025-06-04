/**
 * PipeFitter - Main fluent API class
 * 
 * Provides the core fluent API for pipeline processing:
 * - from() / to() - Data ingress and egress with adapters (with hooks!)
 * - map() / filter() / find() - Functional transformations (with hooks!)
 * - branch() / merge() - Single-depth branching with strategies (with hooks!)
 * 
 * Supports extension registration with configuration management.
 * All methods now support hooks for maximum flexibility.
 */

import { Message, createMessage, createMessageFromData } from './message.js';
import { Context, createContext, BranchState } from './context.js';
import { 
  Adapter, 
  isAdapter, 
  SourceHooks, 
  TransformHooks, 
  OutputHooks, 
  BranchHooks, 
  MergeHooks 
} from './adapter.js';
import { Configuration, ConfigurationManager, ExtensionConfig } from './configuration.js';
import { ResourceManager } from './resource-manager.js';
import { LoggerFactory } from './logger.js';

/**
 * Main PipeFitter class providing fluent API for pipeline processing
 */
export class PipeFitter {
  private message: Message | null = null;
  private context: Context;
  
  /**
   * Create a new PipeFitter instance
   * 
   * @param userConfig - User configuration overrides
   */
  constructor(userConfig: Partial<Configuration> = {}) {
    const config = ConfigurationManager.create(userConfig);
    const logger = LoggerFactory.create();
    const resources = new ResourceManager();
    
    // Set logger level from configuration
    LoggerFactory.setLevel(config.logLevel);
    
    this.context = createContext(logger, config, resources);
  }
  
  /**
   * Set the source for the pipeline
   * Accepts either an adapter with options or a direct object
   * Now supports hooks - before hook receives null message for initialization!
   * 
   * @param source - Adapter instance or direct data object
   * @param options - Options to pass to the adapter
   * @param hooks - Optional source hooks (before gets null message!)
   */
  from(source: object | Adapter, options?: any, hooks?: SourceHooks): PipeFitter {
    // Apply before hook with null message for initialization
    let initialMessage: Message | null = null;
    if (hooks?.before) {
      const beforeResult = hooks.before(null);
      if (beforeResult) {
        initialMessage = beforeResult;
      }
    }
    
    if (isAdapter(source)) {
      // Register adapter for resource management
      this.context.resources.registerAdapter(source);
      
      // Use initialized message or create empty one
      const inputMessage = initialMessage || createMessage(this.context);
      this.message = source.handle(inputMessage, options);
    } else {
      // Direct object input - create message from data
      this.message = initialMessage || createMessageFromData(source, this.context);
    }
    
    // Apply after hook with populated message
    if (hooks?.after && this.message) {
      const afterResult = hooks.after(this.message);
      if (afterResult) {
        this.message = afterResult;
      }
    }
    
    return this;
  }
  
  /**
   * Set the destination for the pipeline (terminal operation)
   * Now supports hooks for complete pipeline control!
   * 
   * @param target - Adapter to handle the final message
   * @param options - Options to pass to the adapter
   * @param hooks - Optional output hooks
   * @returns Final processed result
   */
  to<T = any>(target: Adapter, options?: any, hooks?: OutputHooks<T>): T | Promise<T> {
    this.validateSource();
    
    // Register adapter for resource management
    this.context.resources.registerAdapter(target);
    
    let currentMessage = this.message!;
    
    // Apply before hook
    if (hooks?.before) {
      const beforeResult = hooks.before(currentMessage);
      if (beforeResult) {
        currentMessage = beforeResult;
      }
    }
    
    // Execute adapter
    let result = target.handle(currentMessage, options);
    
    // Apply after hook to result
    if (hooks?.after) {
      const afterResult = hooks.after(result);
      if (afterResult !== undefined) {
        result = afterResult;
      }
    }
    
    return result;
  }
  
  /**
   * Transform every message using the provided function
   * Enhanced with comprehensive hook support
   * 
   * @param fn - Transformation function
   * @param hooks - Optional transform hooks
   */
  map(fn: (msg: Message) => Message, hooks?: TransformHooks): PipeFitter {
    this.validateSource();
    
    // Apply before hook
    if (hooks?.before) {
      const beforeResult = hooks.before(this.message!);
      if (beforeResult) this.message = beforeResult;
    }
    
    // Apply transformation
    this.message = fn(this.message!);
    
    // Apply after hook
    if (hooks?.after) {
      const afterResult = hooks.after(this.message!);
      if (afterResult) this.message = afterResult;
    }
    
    return this;
  }
  
  /**
   * Filter the message based on a predicate
   * Sets data to null if predicate returns false
   * Enhanced with hook support
   * 
   * @param predicate - Function that returns true to keep the message
   * @param hooks - Optional transform hooks
   */
  filter(predicate: (msg: Message) => boolean, hooks?: TransformHooks): PipeFitter {
    this.validateSource();
    
    // Apply before hook
    if (hooks?.before) {
      const beforeResult = hooks.before(this.message!);
      if (beforeResult) this.message = beforeResult;
    }
    
    // Apply filter predicate
    if (!predicate(this.message!)) {
      this.message = {
        ...this.message!,
        data: null
      };
    }
    
    // Apply after hook
    if (hooks?.after) {
      const afterResult = hooks.after(this.message!);
      if (afterResult) this.message = afterResult;
    }
    
    return this;
  }
  
  /**
   * Find the first matching item in array data
   * For non-array data, applies predicate to the message itself
   * Enhanced with hook support
   * 
   * @param predicate - Function to test each item
   * @param hooks - Optional transform hooks
   */
  find(predicate: (msg: Message) => boolean, hooks?: TransformHooks): PipeFitter {
    return this.map(msg => {
      if (Array.isArray(msg.data)) {
        // Find first matching item in array
        const found = msg.data.find(item => {
          const itemMsg = { ...msg, data: item };
          return predicate(itemMsg);
        });
        return { ...msg, data: found || null };
      } else {
        // Apply predicate to message itself
        return predicate(msg) ? msg : { ...msg, data: null };
      }
    }, hooks);
  }
  
  /**
   * Create a branch for conditional processing (single-depth only)
   * Enhanced with hook support for branch creation
   * 
   * @param predicate - Function to determine if this branch should be taken
   * @param hooks - Optional branch hooks
   */
  branch(predicate: (msg: Message) => boolean, hooks?: BranchHooks): PipeFitter {
    this.validateSource();
    
    let currentMessage = this.message!;
    
    // Apply before hook
    if (hooks?.before) {
      const beforeResult = hooks.before(currentMessage);
      if (beforeResult) {
        currentMessage = beforeResult;
      }
    }
    
    // Create new pipeline instance for the branch
    const branchPipeline = new PipeFitter();
    branchPipeline.context = { ...this.context }; // Share context
    
    // Set up branch state
    const branchState: BranchState = {
      parentMessage: currentMessage,
      predicate
    };
    
    branchPipeline.message = {
      ...currentMessage,
      context: {
        ...currentMessage.context,
        branchState
      }
    };
    
    // Apply after hook to branched message
    if (hooks?.after && branchPipeline.message) {
      const afterResult = hooks.after(branchPipeline.message);
      if (afterResult) {
        branchPipeline.message = afterResult;
      }
    }
    
    return branchPipeline;
  }
  
  /**
   * Merge a branch back into the parent pipeline
   * Enhanced with hook support for merge operations
   * 
   * @param strategy - Function to merge branch and parent messages
   * @param hooks - Optional merge hooks
   */
  merge(strategy: (branch: Message, parent: Message) => Message, hooks?: MergeHooks): PipeFitter {
    if (!this.message?.context.branchState) {
      throw new Error("No active branch to merge");
    }
    
    const { parentMessage } = this.message.context.branchState;
    let branchMessage = this.message;
    let parentMsg = parentMessage;
    
    // Apply before hook with both messages
    if (hooks?.before) {
      const beforeResult = hooks.before(branchMessage, parentMsg);
      if (beforeResult) {
        branchMessage = beforeResult.branch;
        parentMsg = beforeResult.parent;
      }
    }
    
    // Apply merge strategy
    this.message = strategy(branchMessage, parentMsg);
    
    // Clear branch state
    this.message.context.branchState = undefined;
    
    // Apply after hook to merged result
    if (hooks?.after) {
      const afterResult = hooks.after(this.message);
      if (afterResult) {
        this.message = afterResult;
      }
    }
    
    return this;
  }
  
  /**
   * Start all managed adapters (calls start() method if available)
   */
  async startAdapters(): Promise<void> {
    await this.context.resources.startAll();
  }
  
  /**
   * Clean up all pipeline resources
   */
  async cleanup(): Promise<void> {
    await this.context.resources.cleanup();
  }
  
  /**
   * Register a custom cleanup callback
   */
  registerCleanup(callback: () => void | Promise<void>): void {
    this.context.resources.registerCleanup(callback);
  }
  
  /**
   * Extension registration - allows adding new methods with configuration
   * 
   * @param name - Method name to add to PipeFitter prototype
   * @param method - Method implementation
   * @param extensionConfig - Optional configuration defaults for the extension
   */
  static registerMethod(
    name: string,
    method: Function,
    extensionConfig?: ExtensionConfig
  ): void {
    // Merge extension configuration into global defaults
    if (extensionConfig) {
      ConfigurationManager.mergeExtensionDefaults(extensionConfig);
    }
    
    // Add method to prototype
    (PipeFitter.prototype as any)[name] = method;
  }
  
  /**
   * Validate that a source has been set before transformation
   */
  private validateSource(): void {
    if (!this.message) {
      throw new Error('No source set: call from() before transformation');
    }
  }
}