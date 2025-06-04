import { Message } from './message.js';

/**
 * Core adapter interface
 */
export interface Adapter {
  /**
   * Process a message
   */
  handle(message: Message, options?: any): Message | Promise<Message>;
  
  /**
   * Optional lifecycle methods
   */
  start?(): void | Promise<void>;
  stop?(): void | Promise<void>;
}

/**
 * Type guard for adapters
 */
export function isAdapter(obj: any): obj is Adapter {
  return obj && typeof obj.handle === 'function';
}