import { Context } from './context.js';
import { FNode, FNodeType, createFNode } from './fnode.js';

/**
 * Message structure for pipeline processing
 * Contains pure FNode data plus processing metadata and execution context
 */
export interface Message {
  /** Pure data structure */
  data: FNode;
  
  /** 
   * Namespaced processing metadata
   * - source: Origin and format information
   * - pipeline: Processing history and stats
   * - format-specific: json, xml, csv processing metadata
   */
  metadata: {
    [namespace: string]: {
      [key: string]: any;
    };
  };
  
  /** Pipeline execution context */
  context: Context;
}

/**
 * Create a new empty message with the given context
 */
export function createMessage(context: Context): Message {
  return {
    data: createFNode(FNodeType.COLLECTION, 'root'),
    metadata: {},
    context
  };
}

/**
 * Create a message from FNode data
 */
export function createMessageFromFNode(data: FNode, context: Context): Message {
  return {
    data,
    metadata: {
      source: { 
        format: detectFormat(data),
        createdAt: new Date().toISOString()
      }
    },
    context
  };
}

/**
 * Simple format detection based on FNode structure
 */
function detectFormat(data: FNode): string {
  if (data.type === FNodeType.COLLECTION) return 'application/json';
  if (data.children && data.children.length > 0) return 'application/json';
  if (data.type === FNodeType.VALUE) return 'text/plain';
  return 'application/octet-stream';
}