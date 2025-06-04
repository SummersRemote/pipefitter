export type Primitive = string | number | boolean | null;

/**
 * Generic node types for format-neutral representation
 */
export enum FNodeType {
  COLLECTION = "collection",    // Containers (arrays, documents, result sets)
  RECORD = "record",           // Structured items (objects, rows, elements)
  FIELD = "field",             // Data points (properties, columns, fields)
  VALUE = "value",             // Primitive values (strings, numbers, booleans)
  ATTRIBUTES = "attributes",   // Metadata (XML attributes, annotations)
  COMMENT = "comment",         // Documentation (comments, descriptions)
  INSTRUCTION = "instruction", // Processing directives (<?xml?>, pragmas)
  CUSTOM = "custom"           // Format-specific extensions
}

/**
 * Format-neutral node structure
 * Pure data representation without processing metadata
 */
export interface FNode {
  /** Node type - semantic meaning */
  type: FNodeType;
  
  /** Local name (tag, property key, column header) */
  name: string;
  
  /** Primitive value for leaf nodes */
  value?: Primitive;
  
  /** Optional unique identifier */
  id?: string;
  
  /** Namespace URI (for XML, RDF, etc.) */
  ns?: string;
  
  /** Display label or namespace prefix (e.g., "ui:collapsed") */
  label?: string;
  
  /** Child nodes for hierarchical structures */
  children?: FNode[];
  
  /** Parent nodes (supports graph structures) */
  parents?: FNode[];
  
  /** Attributes as FNodes (supports namespaced attributes) */
  attributes?: FNode[];
}

/**
 * Create a new FNode with the specified properties
 */
export function createFNode(
  type: FNodeType,
  name: string,
  value?: Primitive
): FNode {
  return { type, name, value };
}

/**
 * Type guard to check if an object is an FNode
 */
export function isFNode(obj: any): obj is FNode {
  return obj && typeof obj === 'object' && 
         typeof obj.type === 'string' && 
         typeof obj.name === 'string';
}