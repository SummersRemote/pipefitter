/**
 * Resource management system
 * 
 * Handles lifecycle management and cleanup for pipeline resources:
 * - Adapter lifecycle (start/stop)
 * - Custom cleanup callbacks
 * - Resource tracking and cleanup coordination
 * 
 * Ensures proper cleanup when pipelines are finished or encounter errors.
 */

import { Adapter } from './adapter.js';

/**
 * Resource cleanup callback function
 */
export type CleanupCallback = () => void | Promise<void>;

/**
 * Resource manager for handling pipeline resource lifecycle
 */
export class ResourceManager {
  private cleanupCallbacks = new Set<CleanupCallback>();
  private managedAdapters = new Set<Adapter>();
  
  /**
   * Register a cleanup callback to be called during pipeline cleanup
   * 
   * @param callback - Function to call during cleanup
   */
  registerCleanup(callback: CleanupCallback): void {
    this.cleanupCallbacks.add(callback);
  }
  
  /**
   * Register an adapter for lifecycle management
   * Automatically registers adapter.stop() as a cleanup callback if available
   * 
   * @param adapter - Adapter to manage
   */
  registerAdapter(adapter: Adapter): void {
    this.managedAdapters.add(adapter);
    
    // Auto-register stop() method as cleanup callback
    if (adapter.stop) {
      this.registerCleanup(() => adapter.stop!());
    }
  }
  
  /**
   * Start all managed adapters
   * Calls start() method on all registered adapters that have one
   */
  async startAll(): Promise<void> {
    const startPromises: Promise<void>[] = [];
    
    for (const adapter of this.managedAdapters) {
      if (adapter.start) {
        try {
          const result = adapter.start();
          if (result instanceof Promise) {
            startPromises.push(result);
          }
        } catch (error) {
          console.warn('Failed to start adapter:', error);
        }
      }
    }
    
    // Wait for all async starts to complete
    await Promise.allSettled(startPromises);
  }
  
  /**
   * Clean up all registered resources
   * Executes all cleanup callbacks and clears internal state
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];
    
    // Execute all cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        const result = callback();
        if (result instanceof Promise) {
          cleanupPromises.push(result);
        }
      } catch (error) {
        console.warn('Cleanup callback error:', error);
      }
    }
    
    // Wait for all async cleanup to complete
    await Promise.allSettled(cleanupPromises);
    
    // Clear internal state
    this.cleanupCallbacks.clear();
    this.managedAdapters.clear();
  }
  
  /**
   * Check if cleanup is recommended based on resource count
   * Useful for long-running applications to prevent resource leaks
   */
  isCleanupRecommended(): boolean {
    return this.cleanupCallbacks.size > 50 || this.managedAdapters.size > 10;
  }
  
  /**
   * Get current resource counts (for monitoring/debugging)
   */
  getResourceCounts(): { callbacks: number; adapters: number } {
    return {
      callbacks: this.cleanupCallbacks.size,
      adapters: this.managedAdapters.size
    };
  }
}