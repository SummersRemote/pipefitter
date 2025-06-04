/**
 * Base PipeFitter error
 */
export class PipeFitterError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'PipeFitterError';
  }
}

/**
 * Adapter-related errors
 */
export class AdapterError extends PipeFitterError {
  constructor(message: string, context?: any) {
    super(message, 'ADAPTER_ERROR', context);
    this.name = 'AdapterError';
  }
}

/**
 * Transformation errors
 */
export class TransformationError extends PipeFitterError {
  constructor(message: string, context?: any) {
    super(message, 'TRANSFORMATION_ERROR', context);
    this.name = 'TransformationError';
  }
}

/**
 * Format semantics errors
 */
export class FormatError extends PipeFitterError {
  constructor(message: string, context?: any) {
    super(message, 'FORMAT_ERROR', context);
    this.name = 'FormatError';
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends PipeFitterError {
  constructor(message: string, context?: any) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}