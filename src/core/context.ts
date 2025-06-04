/**
 * Context interface - Pipeline execution context
 * 
 * Provides access to shared pipeline resources:
 * - logger: Logging interface
 * - config: Merged configuration from extensions and user settings
 * - resources: Resource lifecycle management
 * - branchState: Branch/merge state for single-depth branching
 */

import { Logger } from './logger.js';
import { Configuration } from './configuration.js';
import { ResourceManager } from './resource-manager.js';

/**
 * Forward declaration to avoid circular dependency
 */
export interface Message {
  data: any;
  metadata: Record<string, Record<string, any>>;
  context: Context;
}

/**
 * Branch state for single-depth branching support
 */
export interface BranchState {
  /** The original message before branching */
  parentMessage: Message;
  
  /** The predicate used to create this branch */
  predicate: (msg: Message) => boolean;
}

/**
 * Pipeline execution context available to all operations
 */
export interface Context {
  /** Logger instance for debugging and monitoring */
  logger: Logger;
  
  /** Merged configuration from extensions and user overrides */
  config: Configuration;
  
  /** Resource lifecycle manager */
  resources: ResourceManager;
  
  /** Branch state for single-depth branching (undefined if not in branch) */
  branchState?: BranchState;
}

/**
 * Create a new context with the given components
 */
export function createContext(
  logger: Logger,
  config: Configuration,
  resources: ResourceManager
): Context {
  return {
    logger,
    config,
    resources
  };
}