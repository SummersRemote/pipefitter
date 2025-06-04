import { Configuration, ConfigurationManager } from './configuration.js';
import { FormatSemantics } from '../semantic/format-semantics.js';
import { TransformationEngine } from '../semantic/transformation-engine.js';

/**
 * Extension method definition
 */
export interface ExtensionMethod {
  name: string;
  implementation: Function;
}

/**
 * Extension interface
 */
export interface Extension {
  name: string;
  version: string;
  
  /** Configuration defaults */
  config?: Partial<Configuration>;
  
  /** Format semantics to register */
  formats?: FormatSemantics[];
  
  /** Methods to add to PipeFitter prototype */
  methods?: ExtensionMethod[];
  
  /** Initialization function */
  initialize?(engine: TransformationEngine): void | Promise<void>;
}

/**
 * Extension registry
 */
export class ExtensionRegistry {
  private static extensions = new Map<string, Extension>();
  private static transformationEngine?: TransformationEngine;
  
  /**
   * Set transformation engine for extensions
   */
  static setTransformationEngine(engine: TransformationEngine): void {
    this.transformationEngine = engine;
  }
  
  /**
   * Register an extension
   */
  static async register(extension: Extension): Promise<void> {
    if (this.extensions.has(extension.name)) {
      throw new Error(`Extension ${extension.name} already registered`);
    }
    
    // Register configuration
    if (extension.config) {
      ConfigurationManager.mergeExtensionDefaults(extension.config);
    }
    
    // Register format semantics
    if (extension.formats && this.transformationEngine) {
      for (const format of extension.formats) {
        this.transformationEngine.register(format);
      }
    }
    
    // Register methods
    if (extension.methods) {
      // Import PipeFitter dynamically to avoid circular dependency
      const { PipeFitter } = await import('./pipefitter.js');
      for (const method of extension.methods) {
        PipeFitter.registerMethod(method.name, method.implementation);
      }
    }
    
    // Initialize extension
    if (extension.initialize && this.transformationEngine) {
      await extension.initialize(this.transformationEngine);
    }
    
    this.extensions.set(extension.name, extension);
  }
  
  /**
   * Get registered extension
   */
  static get(name: string): Extension | undefined {
    return this.extensions.get(name);
  }
  
  /**
   * List all registered extensions
   */
  static list(): Extension[] {
    return Array.from(this.extensions.values());
  }
  
  /**
   * Check if extension is registered
   */
  static has(name: string): boolean {
    return this.extensions.has(name);
  }
  
  /**
   * Unregister an extension
   */
  static unregister(name: string): boolean {
    return this.extensions.delete(name);
  }
  
  /**
   * Clear all extensions
   */
  static clear(): void {
    this.extensions.clear();
    ConfigurationManager.resetDefaults();
  }
  
  /**
   * Get extension count
   */
  static count(): number {
    return this.extensions.size;
  }
}