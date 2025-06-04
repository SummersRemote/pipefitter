/**
 * Adapter interface - Handles message input/output and processing
 * 
 * Adapters are the primary extension points for PipeFitter, enabling:
 * - Data ingress (reading from files, databases, APIs, etc.)
 * - Data egress (writing to files, databases, APIs, etc.)
 * - Event-driven processing (file watchers, message queues, etc.)
 * 
 * Adapters can be stateful and support lifecycle management.
 */

import { Message } from './message.js';

/**
 * Core adapter interface for processing messages
 */
export interface Adapter {
  /**
   * Process a message and return the result
   * 
   * @param message - The input message to process
   * @param options - Adapter-specific configuration options
   * @returns Processed message (can be async)
   */
  handle(message: Message, options?: any): Message | Promise<Message>;
  
  /**
   * Optional lifecycle method - called when pipeline starts
   * Use for initializing connections, starting watchers, etc.
   */
  start?(): void | Promise<void>;
  
  /**
   * Optional lifecycle method - called during cleanup
   * Use for closing connections, stopping watchers, etc.
   */
  stop?(): void | Promise<void>;
}

/**
 * Type guard to check if an object is an adapter
 */
export function isAdapter(obj: any): obj is Adapter {
  return obj && typeof obj.handle === 'function';
}

/**
 * Hook function types for different pipeline stages
 */

/**
 * Source hook - for from() operations
 * Before hook receives null message (for initialization)
 * After hook receives populated message
 */
export interface SourceHooks {
  before?: (message: Message | null) => Message | null | void;
  after?: (message: Message) => Message | void;
}

/**
 * Transform hook - for map(), filter(), find() operations
 * Both hooks receive the current message
 */
export interface TransformHooks {
  before?: (message: Message) => Message | void;
  after?: (message: Message) => Message | void;
}

/**
 * Output hook - for to() operations
 * Before hook receives final message before output
 * After hook receives the result of the adapter
 */
export interface OutputHooks<T = any> {
  before?: (message: Message) => Message | void;
  after?: (result: T) => T | void;
}

/**
 * Branch hook - for branch() operations
 */
export interface BranchHooks {
  before?: (message: Message) => Message | void;
  after?: (branchedMessage: Message) => Message | void;
}

/**
 * Merge hook - for merge() operations
 */
export interface MergeHooks {
  before?: (branchMessage: Message, parentMessage: Message) => { branch: Message; parent: Message } | void;
  after?: (mergedMessage: Message) => Message | void;
}