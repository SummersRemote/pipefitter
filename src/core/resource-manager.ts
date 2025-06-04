/**
 * Resource cleanup callback
 */
export type CleanupCallback = () => void | Promise<void>;

/**
 * Adapter interface for resource management
 */
export interface ManagedAdapter {
  start?(): void | Promise<void>;
  stop?(): void | Promise<void>;
}

/**
 * Essential resource management
 */
export class ResourceManager {
  private cleanupCallbacks = new Set<CleanupCallback>();
  private managedAdapters = new Set<ManagedAdapter>();
  
  /**
   * Register cleanup callback
   */
  registerCleanup(callback: CleanupCallback): void {
    this.cleanupCallbacks.add(callback);
  }
  
  /**
   * Register adapter for lifecycle management
   */
  registerAdapter(adapter: ManagedAdapter): void {
    this.managedAdapters.add(adapter);
    
    if (adapter.stop) {
      this.registerCleanup(() => adapter.stop!());
    }
  }
  
  /**
   * Start all managed adapters
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
    
    await Promise.allSettled(startPromises);
  }
  
  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];
    
    for (const callback of this.cleanupCallbacks) {
      try {
        const result = callback();
        if (result instanceof Promise) {
          cleanupPromises.push(result);
        }
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    }
    
    await Promise.allSettled(cleanupPromises);
    
    this.cleanupCallbacks.clear();
    this.managedAdapters.clear();
  }
  
  /**
   * Get resource counts for monitoring
   */
  getResourceCounts(): { callbacks: number; adapters: number } {
    return {
      callbacks: this.cleanupCallbacks.size,
      adapters: this.managedAdapters.size
    };
  }
}