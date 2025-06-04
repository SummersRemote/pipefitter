/**
 * Function composition utilities for PipeFitter
 */

import { Message } from '../core/message.js';

/**
 * Generic function type for pipeline transformations
 */
export type TransformFunction<T, R> = (input: T) => R;

/**
 * Message transformation function type
 */
export type MessageTransform = TransformFunction<Message, Message>;

/**
 * Compose two functions: (b -> c) -> (a -> b) -> (a -> c)
 */
export function compose<A, B, C>(
  f: TransformFunction<B, C>,
  g: TransformFunction<A, B>
): TransformFunction<A, C> {
  return (input: A) => f(g(input));
}

/**
 * Compose multiple functions from left to right
 */
export function pipe<T>(...functions: TransformFunction<T, T>[]): TransformFunction<T, T> {
  return (input: T) => functions.reduce((result, fn) => fn(result), input);
}

/**
 * Compose multiple functions from right to left
 */
export function flow<T>(...functions: TransformFunction<T, T>[]): TransformFunction<T, T> {
  return (input: T) => functions.reduceRight((result, fn) => fn(result), input);
}

/**
 * Create a partial application of a function
 */
export function partial<A, B, C>(
  fn: (a: A, b: B) => C,
  a: A
): (b: B) => C {
  return (b: B) => fn(a, b);
}

/**
 * Curry a binary function
 */
export function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

/**
 * Create an identity function
 */
export function identity<T>(x: T): T {
  return x;
}

/**
 * Create a constant function
 */
export function constant<T>(value: T): () => T {
  return () => value;
}

/**
 * Create a message transform that applies a transformation conditionally
 */
export function when(
  predicate: (msg: Message) => boolean,
  transform: MessageTransform
): MessageTransform {
  return (msg: Message) => predicate(msg) ? transform(msg) : msg;
}

/**
 * Create a message transform that applies transformation unless condition is met
 */
export function unless(
  predicate: (msg: Message) => boolean,
  transform: MessageTransform
): MessageTransform {
  return (msg: Message) => predicate(msg) ? msg : transform(msg);
}

/**
 * Tap function - apply side effect without changing the value
 */
export function tap<T>(sideEffect: (value: T) => void): TransformFunction<T, T> {
  return (value: T) => {
    sideEffect(value);
    return value;
  };
}

/**
 * Memoize a function with simple cache
 */
export function memoize<A, R>(fn: TransformFunction<A, R>): TransformFunction<A, R> {
  const cache = new Map<A, R>();
  
  return (input: A) => {
    if (cache.has(input)) {
      return cache.get(input)!;
    }
    
    const result = fn(input);
    cache.set(input, result);
    return result;
  };
}

/**
 * Debounce a function
 */
export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends any[]>(
  fn: (...args: T) => void,
  limit: number
): (...args: T) => void {
  let inThrottle: boolean;
  
  return (...args: T) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Create a function that catches errors and returns a default value
 */
export function safe<T, R>(
  fn: TransformFunction<T, R>,
  defaultValue: R
): TransformFunction<T, R> {
  return (input: T) => {
    try {
      return fn(input);
    } catch {
      return defaultValue;
    }
  };
}

/**
 * Create a function that logs execution time
 */
export function timed<T, R>(
  fn: TransformFunction<T, R>,
  label?: string
): TransformFunction<T, R> {
  return (input: T) => {
    const start = performance.now();
    const result = fn(input);
    const end = performance.now();
    
    console.log(`${label || 'Function'} executed in ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

/**
 * Create a sequence of message transformations
 */
export function sequence(...transforms: MessageTransform[]): MessageTransform {
  return pipe(...transforms);
}

/**
 * Create a parallel composition of transformations (all applied to same input)
 */
export function parallel<T, R>(...functions: TransformFunction<T, R>[]): TransformFunction<T, R[]> {
  return (input: T) => functions.map(fn => fn(input));
}