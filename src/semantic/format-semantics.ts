import { FNode, FNodeType } from '../core/fnode.js';

/**
 * Supported format types
 */
export enum FormatType {
  JSON = "json",
  XML = "xml",
  CSV = "csv",
  YAML = "yaml",
  DATABASE = "database",
  CUSTOM = "custom"
}

/**
 * Semantic roles that nodes play in different formats
 */
export enum SemanticRole {
  ROOT = "root",               // Top-level container
  CONTAINER = "container",     // Collection of items
  ITEM = "item",              // Individual data item
  PROPERTY = "property",       // Key-value pair
  VALUE = "value",            // Primitive value
  METADATA = "metadata",      // Format-specific metadata
  ANNOTATION = "annotation"   // Comments, documentation
}

/**
 * Transformation strategies for format conversion
 */
export enum TransformationStrategy {
  PRESERVE = "preserve",           // Keep as-is
  CONVERT = "convert",            // Convert to different type
  FLATTEN = "flatten",            // Flatten into parent
  PROMOTE = "promote",            // Promote to higher level
  DEMOTE = "demote",             // Demote to lower level
  DROP = "drop"                  // Remove entirely
}

/**
 * Format-specific semantic rules
 */
export interface FormatSemantics {
  format: FormatType;
  
  /** How FNode types map to semantic roles */
  typeToRole: Map<FNodeType, SemanticRole>;
  
  /** How semantic roles map to FNode types */
  roleToType: Map<SemanticRole, FNodeType>;
  
  /** Transformation rules for format conversion */
  transformationRules: {
    collections: TransformationStrategy;
    records: TransformationStrategy;
    attributes: TransformationStrategy;
    comments: TransformationStrategy;
  };
  
  /** Query strategy for functional operations */
  queryStrategy: {
    findItems: (node: FNode) => FNode[];
    extractValue: (node: FNode, key: string) => any;
    navigatePath: (node: FNode, path: string[]) => FNode | undefined;
  };
}

/**
 * JSON format semantics
 */
export const JSON_SEMANTICS: FormatSemantics = {
  format: FormatType.JSON,
  typeToRole: new Map([
    [FNodeType.COLLECTION, SemanticRole.CONTAINER],
    [FNodeType.RECORD, SemanticRole.ITEM],
    [FNodeType.FIELD, SemanticRole.PROPERTY],
    [FNodeType.VALUE, SemanticRole.VALUE],
    [FNodeType.COMMENT, SemanticRole.ANNOTATION]
  ]),
  roleToType: new Map([
    [SemanticRole.ROOT, FNodeType.RECORD],
    [SemanticRole.CONTAINER, FNodeType.COLLECTION],
    [SemanticRole.ITEM, FNodeType.RECORD],
    [SemanticRole.PROPERTY, FNodeType.FIELD],
    [SemanticRole.VALUE, FNodeType.VALUE]
  ]),
  transformationRules: {
    collections: TransformationStrategy.PRESERVE,
    records: TransformationStrategy.PRESERVE,
    attributes: TransformationStrategy.CONVERT, // Convert to fields
    comments: TransformationStrategy.DROP
  },
  queryStrategy: {
    findItems: (node) => node.children?.filter(child => 
      child.type === FNodeType.RECORD || child.type === FNodeType.COLLECTION
    ) || [],
    extractValue: (node, key) => node.children?.find(child => 
      child.name === key
    )?.value,
    navigatePath: (node, path) => navigateJsonPath(node, path)
  }
};

/**
 * CSV format semantics
 */
export const CSV_SEMANTICS: FormatSemantics = {
  format: FormatType.CSV,
  typeToRole: new Map([
    [FNodeType.COLLECTION, SemanticRole.ROOT],
    [FNodeType.RECORD, SemanticRole.ITEM],
    [FNodeType.FIELD, SemanticRole.PROPERTY],
    [FNodeType.VALUE, SemanticRole.VALUE]
  ]),
  roleToType: new Map([
    [SemanticRole.ROOT, FNodeType.COLLECTION],
    [SemanticRole.CONTAINER, FNodeType.COLLECTION],
    [SemanticRole.ITEM, FNodeType.RECORD],
    [SemanticRole.PROPERTY, FNodeType.FIELD],
    [SemanticRole.VALUE, FNodeType.VALUE]
  ]),
  transformationRules: {
    collections: TransformationStrategy.PRESERVE,
    records: TransformationStrategy.PRESERVE,
    attributes: TransformationStrategy.PROMOTE, // Promote to metadata
    comments: TransformationStrategy.PROMOTE
  },
  queryStrategy: {
    findItems: (node) => node.children?.filter(child => 
      child.name === "row"
    ) || [],
    extractValue: (node, key) => node.children?.find(child => 
      child.name === key
    )?.value,
    navigatePath: (node, path) => navigateCsvPath(node, path)
  }
};

/**
 * XML format semantics
 */
export const XML_SEMANTICS: FormatSemantics = {
  format: FormatType.XML,
  typeToRole: new Map([
    [FNodeType.RECORD, SemanticRole.ITEM],
    [FNodeType.COLLECTION, SemanticRole.CONTAINER],
    [FNodeType.FIELD, SemanticRole.PROPERTY],
    [FNodeType.VALUE, SemanticRole.VALUE],
    [FNodeType.ATTRIBUTES, SemanticRole.METADATA],
    [FNodeType.COMMENT, SemanticRole.ANNOTATION],
    [FNodeType.INSTRUCTION, SemanticRole.METADATA]
  ]),
  roleToType: new Map([
    [SemanticRole.ROOT, FNodeType.RECORD],
    [SemanticRole.CONTAINER, FNodeType.COLLECTION],
    [SemanticRole.ITEM, FNodeType.RECORD],
    [SemanticRole.PROPERTY, FNodeType.FIELD],
    [SemanticRole.VALUE, FNodeType.VALUE],
    [SemanticRole.METADATA, FNodeType.ATTRIBUTES],
    [SemanticRole.ANNOTATION, FNodeType.COMMENT]
  ]),
  transformationRules: {
    collections: TransformationStrategy.PRESERVE,
    records: TransformationStrategy.PRESERVE,
    attributes: TransformationStrategy.PRESERVE,
    comments: TransformationStrategy.PRESERVE
  },
  queryStrategy: {
    findItems: (node) => node.children?.filter(child => 
      child.type === FNodeType.RECORD
    ) || [],
    extractValue: (node, key) => {
      // First check attributes
      const attrValue = node.attributes?.find(attr => attr.name === key)?.value;
      if (attrValue !== undefined) return attrValue;
      
      // Then check child elements
      return node.children?.find(child => child.name === key)?.value;
    },
    navigatePath: (node, path) => navigateXmlPath(node, path)
  }
};

// Helper functions for path navigation

function navigateJsonPath(node: FNode, path: string[]): FNode | undefined {
  let current = node;
  for (const segment of path) {
    if (!current.children) return undefined;
    const next = current.children.find(child => child.name === segment);
    if (!next) return undefined;
    current = next;
  }
  return current;
}

function navigateCsvPath(node: FNode, path: string[]): FNode | undefined {
  // CSV path: ["row", "2", "name"] -> row 2, column name
  let current = node;
  for (const segment of path) {
    if (!current.children) return undefined;
    if (segment === "row") {
      const next = current.children.find(child => child.name === "row");
      if (!next) return undefined;
      current = next;
    } else if (/^\d+$/.test(segment)) {
      const index = parseInt(segment);
      const rows = current.children.filter(child => child.name === "row");
      if (index >= rows.length) return undefined;
      current = rows[index];
    } else {
      const next = current.children.find(child => child.name === segment);
      if (!next) return undefined;
      current = next;
    }
  }
  return current;
}

function navigateXmlPath(node: FNode, path: string[]): FNode | undefined {
  let current = node;
  for (const segment of path) {
    if (!current.children) return undefined;
    
    // Handle attribute access with @ prefix
    if (segment.startsWith('@')) {
      const attrName = segment.substring(1);
      return current.attributes?.find(attr => attr.name === attrName);
    }
    
    // Handle element access
    const next = current.children.find(child => child.name === segment);
    if (!next) return undefined;
    current = next;
  }
  return current;
}