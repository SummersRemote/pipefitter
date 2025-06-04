/**
 * Message interface - Core data structure for PipeFitter pipeline
 * 
 * A Message represents the data flowing through a pipeline, containing:
 * - data: The actual payload being processed
 * - metadata: Namespaced key-value pairs for additional information
 * - context: Pipeline execution context (logger, config, resources, etc.)
 * 
 * Messages are immutable - each operation returns a new Message instance.
 */

import { Context } from './context.js';

/**
 * Core message structure flowing through the pipeline
 */
export interface Message {
  /** The actual data payload being processed */
  data: any;
  
  /** 
   * Namespaced metadata about the message
   * - data.format: MIME type of the data (e.g., 'application/json')
   * - source: Information about data origin
   * - processing: Information about transformations applied
   */
  metadata: Record<string, Record<string, any>>;
  
  /** Pipeline execution context */
  context: Context;
}

/**
 * Create a new empty message with the given context
 */
export function createMessage(context: Context): Message {
  return {
    data: null,
    metadata: {},
    context
  };
}

/**
 * Create a new message from data with format detection
 */
export function createMessageFromData(data: any, context: Context): Message {
  return {
    data,
    metadata: {
      data: { format: detectFormat(data) }
    },
    context
  };
}

/**
 * Simple format detection based on data type
 */
function detectFormat(data: any): string {
  if (Array.isArray(data)) return 'application/json';
  if (typeof data === 'object' && data !== null) return 'application/json';
  if (typeof data === 'string') return 'text/plain';
  if (typeof data === 'number') return 'application/json';
  if (typeof data === 'boolean') return 'application/json';
  return 'application/octet-stream';
}