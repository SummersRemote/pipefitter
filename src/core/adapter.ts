import { Message } from './message.js';

/**
 * Core adapter interface
 */

export interface InputAdapter {
  handle(input: any, options?: any): Message | Promise<Message>;

  /**
   * Optional lifecycle methods
   */
  start?(): void | Promise<void>;
  stop?(): void | Promise<void>;
}

export interface OutputAdapter<T = any> {
  handle(message: Message, options?: any): T | Promise<T>;

  /**
   * Optional lifecycle methods
   */
  start?(): void | Promise<void>;
  stop?(): void | Promise<void>;
}

/**
 * Type guard for adapters
 */
export type Adapter = InputAdapter | OutputAdapter;

export function isAdapter(obj: any): obj is Adapter {
  return obj && typeof obj.handle === 'function';
}