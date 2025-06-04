import { LogLevel } from './logger.js';

/**
 * Base configuration interface
 */
export interface Configuration {
  /** Global log level */
  logLevel: LogLevel;
  
  /** Enable semantic transformations */
  enableSemanticTransforms: boolean;
  
  /** Default format for auto-detection */
  defaultFormat: string;
  
  // Extensions can augment this via module augmentation
}

/**
 * Extension configuration type
 */
export type ExtensionConfig = Record<string, any>;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Configuration = {
  logLevel: LogLevel.INFO,
  enableSemanticTransforms: true,
  defaultFormat: 'json'
};

/**
 * Configuration manager
 */
export class ConfigurationManager {
  private static globalDefaults: Configuration = { ...DEFAULT_CONFIG };
  
  /**
   * Merge extension defaults into global defaults
   */
  static mergeExtensionDefaults(extensionConfig: Partial<Configuration>): void {
    this.globalDefaults = { ...this.globalDefaults, ...extensionConfig };
  }
  
  /**
   * Create configuration with user overrides
   */
  static create(userConfig: Partial<Configuration> = {}): Configuration {
    return { ...this.globalDefaults, ...userConfig };
  }
  
  /**
   * Get current global defaults
   */
  static getGlobalDefaults(): Configuration {
    return { ...this.globalDefaults };
  }
  
  /**
   * Reset to core defaults
   */
  static resetDefaults(): void {
    this.globalDefaults = { ...DEFAULT_CONFIG };
  }
}