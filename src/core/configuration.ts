/**
 * Configuration management system
 * 
 * Provides centralized configuration management with extension support.
 * Extensions can register default configurations that get merged with
 * user-provided configuration at runtime.
 * 
 * Similar to XJX configuration system but simplified.
 */

import { LogLevel } from './logger.js';

/**
 * Base configuration interface
 * Extensions can augment this via TypeScript module augmentation
 */
export interface Configuration {
  /** Global log level for the pipeline */
  logLevel: LogLevel;
  
  // Extensions add their configuration sections like:
  // myExtension?: MyExtensionConfig;
}

/**
 * Type for extension configuration objects
 */
export type ExtensionConfig = Record<string, any>;

/**
 * Default core configuration
 */
const DEFAULT_CONFIG: Configuration = {
  logLevel: LogLevel.INFO
};

/**
 * Configuration manager - handles merging extension defaults with user config
 */
export class ConfigurationManager {
  private static globalDefaults: Configuration = { ...DEFAULT_CONFIG };
  
  /**
   * Merge extension configuration defaults into global defaults
   * Called during extension registration
   */
  static mergeExtensionDefaults(extensionConfig: Partial<Configuration>): void {
    this.globalDefaults = deepMerge(this.globalDefaults, extensionConfig);
  }
  
  /**
   * Create a configuration instance with user overrides
   */
  static create(userConfig: Partial<Configuration> = {}): Configuration {
    return deepMerge(this.globalDefaults, userConfig);
  }
  
  /**
   * Get current global defaults (useful for testing/debugging)
   */
  static getGlobalDefaults(): Configuration {
    return { ...this.globalDefaults };
  }
  
  /**
   * Reset global defaults to core defaults (useful for testing)
   */
  static resetDefaults(): void {
    this.globalDefaults = { ...DEFAULT_CONFIG };
  }
}

/**
 * Deep merge utility for configuration objects
 * Recursively merges nested objects while preserving types
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = (result as any)[key];
    
    if (sourceValue !== null && 
        typeof sourceValue === 'object' && 
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)) {
      // Recursively merge nested objects
      (result as any)[key] = deepMerge(targetValue, sourceValue);
    } else {
      // Direct assignment for primitives, arrays, and null values
      (result as any)[key] = sourceValue;
    }
  }
  
  return result;
}