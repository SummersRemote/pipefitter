import { FNode, FNodeType } from '../core/fnode.js';
import { Message } from '../core/message.js';
import { FormatType } from './format-semantics.js';
import { TransformationEngine } from './transformation-engine.js';

/**
 * Format-aware functional operations
 */
export class FormatAwareOperations {
  constructor(private engine: TransformationEngine) {}
  
  /**
   * Find items matching predicate in format-aware manner
   */
  find(
    message: Message,
    predicate: (item: FNode) => boolean,
    format: FormatType
  ): FNode[] {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.filter(predicate);
  }
  
  /**
   * Filter items in format-aware manner
   */
  filter(
    message: Message,
    predicate: (item: FNode) => boolean,
    format: FormatType
  ): Message {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    const filtered = items.filter(predicate);
    
    // Reconstruct data with filtered items
    const newData = this.reconstructWithItems(message.data, filtered, format);
    
    return {
      ...message,
      data: newData,
      metadata: {
        ...message.metadata,
        processing: {
          operation: 'filter',
          originalCount: items.length,
          filteredCount: filtered.length,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Map over items in format-aware manner
   */
  map<T>(
    message: Message,
    mapper: (item: FNode) => T,
    format: FormatType
  ): T[] {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.map(mapper);
  }
  
  /**
   * Transform items in format-aware manner
   */
  transform(
    message: Message,
    transformer: (item: FNode) => FNode,
    format: FormatType
  ): Message {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    const transformedItems = items.map(transformer);
    
    // Reconstruct data with transformed items
    const newData = this.reconstructWithItems(message.data, transformedItems, format);
    
    return {
      ...message,
      data: newData,
      metadata: {
        ...message.metadata,
        processing: {
          operation: 'transform',
          itemCount: transformedItems.length,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Extract value from node in format-aware manner
   */
  extractValue(node: FNode, key: string, format: FormatType): any {
    const semantics = this.engine.getSemantics(format);
    return semantics.queryStrategy.extractValue(node, key);
  }
  
  /**
   * Navigate to node using path in format-aware manner
   */
  navigatePath(node: FNode, path: string[], format: FormatType): FNode | undefined {
    const semantics = this.engine.getSemantics(format);
    return semantics.queryStrategy.navigatePath(node, path);
  }
  
  /**
   * Group items by key extractor
   */
  groupBy(
    message: Message,
    keyExtractor: (item: FNode) => string,
    format: FormatType
  ): Map<string, FNode[]> {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    
    const groups = new Map<string, FNode[]>();
    for (const item of items) {
      const key = keyExtractor(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    
    return groups;
  }
  
  /**
   * Reduce items to single value
   */
  reduce<T>(
    message: Message,
    reducer: (accumulator: T, current: FNode, index: number) => T,
    initialValue: T,
    format: FormatType
  ): T {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.reduce(reducer, initialValue);
  }
  
  /**
   * Find first item matching predicate
   */
  findFirst(
    message: Message,
    predicate: (item: FNode) => boolean,
    format: FormatType
  ): FNode | undefined {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.find(predicate);
  }
  
  /**
   * Check if any item matches predicate
   */
  some(
    message: Message,
    predicate: (item: FNode) => boolean,
    format: FormatType
  ): boolean {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.some(predicate);
  }
  
  /**
   * Check if all items match predicate
   */
  every(
    message: Message,
    predicate: (item: FNode) => boolean,
    format: FormatType
  ): boolean {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    return items.every(predicate);
  }
  
  /**
   * Count items matching predicate
   */
  count(
    message: Message,
    format: FormatType,
    predicate?: (item: FNode) => boolean
  ): number {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    
    if (predicate) {
      return items.filter(predicate).length;
    }
    return items.length;
  }
  
  /**
   * Sort items using comparator
   */
  sort(
    message: Message,
    comparator: (a: FNode, b: FNode) => number,
    format: FormatType
  ): Message {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    const sortedItems = [...items].sort(comparator);
    
    // Reconstruct data with sorted items
    const newData = this.reconstructWithItems(message.data, sortedItems, format);
    
    return {
      ...message,
      data: newData,
      metadata: {
        ...message.metadata,
        processing: {
          operation: 'sort',
          itemCount: sortedItems.length,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Take first n items
   */
  take(
    message: Message,
    count: number,
    format: FormatType
  ): Message {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    const takenItems = items.slice(0, count);
    
    // Reconstruct data with taken items
    const newData = this.reconstructWithItems(message.data, takenItems, format);
    
    return {
      ...message,
      data: newData,
      metadata: {
        ...message.metadata,
        processing: {
          operation: 'take',
          originalCount: items.length,
          takenCount: takenItems.length,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Skip first n items
   */
  skip(
    message: Message,
    count: number,
    format: FormatType
  ): Message {
    const semantics = this.engine.getSemantics(format);
    const items = semantics.queryStrategy.findItems(message.data);
    const remainingItems = items.slice(count);
    
    // Reconstruct data with remaining items
    const newData = this.reconstructWithItems(message.data, remainingItems, format);
    
    return {
      ...message,
      data: newData,
      metadata: {
        ...message.metadata,
        processing: {
          operation: 'skip',
          originalCount: items.length,
          skippedCount: count,
          remainingCount: remainingItems.length,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Reconstruct data structure with new items while preserving format semantics
   */
  private reconstructWithItems(
    originalData: FNode,
    items: FNode[],
    format: FormatType
  ): FNode {
    // For most formats, this is a simple replacement of children
    // More sophisticated formats might need specialized reconstruction
    switch (format) {
      case FormatType.CSV:
        return {
          ...originalData,
          children: items.map(item => ({
            ...item,
            name: 'row' // Ensure proper CSV row naming
          }))
        };
        
      case FormatType.JSON:
      case FormatType.XML:
      default:
        return {
          ...originalData,
          children: items
        };
    }
  }
  
  /**
   * Create a query builder for complex operations
   */
  query(message: Message, format: FormatType): FormatAwareQuery {
    return new FormatAwareQuery(message, format, this);
  }
}

/**
 * Query builder for complex format-aware operations
 */
export class FormatAwareQuery {
  constructor(
    private message: Message,
    private format: FormatType,
    private operations: FormatAwareOperations
  ) {}
  
  filter(predicate: (item: FNode) => boolean): FormatAwareQuery {
    this.message = this.operations.filter(this.message, predicate, this.format);
    return this;
  }
  
  transform(transformer: (item: FNode) => FNode): FormatAwareQuery {
    this.message = this.operations.transform(this.message, transformer, this.format);
    return this;
  }
  
  sort(comparator: (a: FNode, b: FNode) => number): FormatAwareQuery {
    this.message = this.operations.sort(this.message, comparator, this.format);
    return this;
  }
  
  take(count: number): FormatAwareQuery {
    this.message = this.operations.take(this.message, count, this.format);
    return this;
  }
  
  skip(count: number): FormatAwareQuery {
    this.message = this.operations.skip(this.message, count, this.format);
    return this;
  }
  
  execute(): Message {
    return this.message;
  }
  
  map<T>(mapper: (item: FNode) => T): T[] {
    return this.operations.map(this.message, mapper, this.format);
  }
  
  count(predicate?: (item: FNode) => boolean): number {
    return this.operations.count(this.message, this.format, predicate);
  }
  
  groupBy(keyExtractor: (item: FNode) => string): Map<string, FNode[]> {
    return this.operations.groupBy(this.message, keyExtractor, this.format);
  }
}