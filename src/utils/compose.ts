/**
 * Compose utility for functional composition
 * 
 * Enables combining multiple transformation functions into a single function.
 * Functions are applied right-to-left (functional programming style).
 */

/**
 * Compose multiple functions into a single function
 * Functions are applied right-to-left: compose(f, g, h)(x) = f(g(h(x)))
 * 
 * @param fns - Functions to compose
 * @returns Single composed function
 * 
 * @example
 * ```typescript
 * const transform = compose(
 *   msg => ({ ...msg, data: msg.data.toUpperCase() }),
 *   msg => ({ ...msg, data: msg.data.trim() }),
 *   msg => ({ ...msg, data: `Hello ${msg.data}` })
 * );
 * 
 * pipeline.map(transform);
 * ```
 */
export function compose<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
  if (fns.length === 0) {
    // Identity function if no functions provided
    return (arg: T) => arg;
  }
  
  if (fns.length === 1) {
    // Single function - return as-is
    return fns[0];
  }
  
  // Compose functions right-to-left
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

/**
 * Pipe utility for left-to-right function composition
 * Functions are applied left-to-right: pipe(f, g, h)(x) = h(g(f(x)))
 * 
 * @param fns - Functions to pipe
 * @returns Single piped function
 * 
 * @example
 * ```typescript
 * const transform = pipe(
 *   msg => ({ ...msg, data: `Hello ${msg.data}` }),
 *   msg => ({ ...msg, data: msg.data.trim() }),
 *   msg => ({ ...msg, data: msg.data.toUpperCase() })
 * );
 * 
 * pipeline.map(transform);
 * ```
 */
export function pipe<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
  if (fns.length === 0) {
    // Identity function if no functions provided
    return (arg: T) => arg;
  }
  
  if (fns.length === 1) {
    // Single function - return as-is
    return fns[0];
  }
  
  // Compose functions left-to-right
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}