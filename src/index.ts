// src/index.ts
// Core exports
export { PipeFitter, PipelineHook } from './core/pipefitter.js';

// Data structures
export { FNode, Primitive, FNodeType, createFNode, isFNode } from './core/fnode.js';
export { Message, createMessage, createMessageFromFNode } from './core/message.js';
export { Context, BranchState, createContext } from './core/context.js';

// Infrastructure
export { Logger, LogLevel, LoggerFactory, ConsoleLogger } from './core/logger.js';
export { Configuration, ExtensionConfig, ConfigurationManager } from './core/configuration.js';
export { ResourceManager, CleanupCallback, ManagedAdapter } from './core/resource-manager.js';

// Adapters
export { Adapter, isAdapter } from './core/adapter.js';
export { JsonAdapter, JsonAdapterOptions } from './adapters/index.js';

// Errors
export {
  PipeFitterError,
  AdapterError,
  TransformationError,
  FormatError,
  ConfigurationError
} from './core/errors.js';

// Extensions
export { Extension, ExtensionMethod, ExtensionRegistry } from './core/extensions.js';

// Utilities
export { 
  TransformFunction, 
  MessageTransform,
  compose,
  pipe,
  flow,
  partial,
  curry,
  identity,
  constant,
  when,
  unless,
  tap,
  memoize,
  debounce,
  throttle,
  retry,
  safe,
  timed,
  sequence,
  parallel
} from './utils/index.js';

// Semantic layer - re-export for convenience
export { 
  FormatSemantics, 
  SemanticNode,
  FormatType,
  SemanticRole,
  TransformationStrategy,
  JSON_SEMANTICS,
  CSV_SEMANTICS,
  XML_SEMANTICS,
  TransformationEngine,
  FormatAwareOperations,
  FormatAwareQuery
} from './semantic/index.js';