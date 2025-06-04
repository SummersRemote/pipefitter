import { Logger } from './logger.js';
import { Configuration } from './configuration.js';
import { ResourceManager } from './resource-manager.js';

// Forward declaration to avoid circular dependency
export interface Message {
  data: any;
  metadata: Record<string, Record<string, any>>;
  context: Context;
}

/**
 * Branch state for conditional processing
 */
export interface BranchState {
  /** Original message before branching */
  parentMessage: Message;
  
  /** Predicate used to create this branch */
  predicate: (msg: Message) => boolean;
}

/**
 * Pipeline execution context
 * Provides access to shared resources and execution state
 */
export interface Context {
  /** Logger instance for debugging and monitoring */
  logger: Logger;
  
  /** Merged configuration from extensions and user overrides */
  config: Configuration;
  
  /** Resource lifecycle manager */
  resources: ResourceManager;
  
  /** Branch state for conditional processing (undefined if not in branch) */
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