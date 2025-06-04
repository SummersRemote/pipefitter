/**
 * PipeFitter - Minimal Fluent API Framework
 * 
 * A lightweight, extensible framework for building fluent APIs with pipeline processing.
 * Inspired by Apache Camel and functional programming principles.
 * 
 * Key Features:
 * - Immutable message flow
 * - Event-driven adapters with lifecycle management
 * - Single-depth branch/merge with format-aware strategies
 * - Extension system with configuration management
 * - Resource management and cleanup
 * - Replaceable logger interface
 */

// Core exports
export { PipeFitter } from './core/pipefitter';
export { Message, createMessage, createMessageFromData } from './core/message';
export { Context, BranchState, createContext } from './core/context';
export { Adapter, isAdapter, Hook } from './core/adapter';

// Configuration system
export { 
  Configuration, 
  ConfigurationManager, 
  ExtensionConfig 
} from './core/configuration';

// Resource management
export { ResourceManager, CleanupCallback } from './core/resource-manager';

// Logging
export { 
  Logger, 
  LogLevel, 
  LoggerFactory, 
  ConsoleLogger 
} from './core/logger';

// Utilities
export { compose, pipe } from './utils/compose';

// Built-in adapters with fluent builder pattern
export { 
  StringAdapter, 
  StringAdapterOptions
} from './adapters/string-adapter';

export { 
  JsonAdapter, 
  JsonAdapterOptions
} from './adapters/json-adapter';

// Re-export main class as default
export { PipeFitter as default } from './core/pipefitter';