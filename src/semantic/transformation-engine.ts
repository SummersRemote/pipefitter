import { FNode, FNodeType } from '../core/fnode.js';
import { Message } from '../core/message.js';
import { FormatSemantics, FormatType, SemanticRole, TransformationStrategy } from './format-semantics.js';

/**
 * Semantic node representation (format-neutral intermediate)
 */
export interface SemanticNode {
  role: SemanticRole;
  name: string;
  value?: any;
  id?: string;
  ns?: string;
  label?: string;
  children?: SemanticNode[];
  parents?: SemanticNode[];
  attributes?: SemanticNode[];
}

/**
 * Handles transformations between format semantics
 */
export class TransformationEngine {
  private semanticsRegistry = new Map<FormatType, FormatSemantics>();
  
  /**
   * Register format semantics
   */
  register(semantics: FormatSemantics): void {
    this.semanticsRegistry.set(semantics.format, semantics);
  }
  
  /**
   * Transform FNode from source format to target format
   */
  transform(
    node: FNode,
    sourceFormat: FormatType,
    targetFormat: FormatType
  ): FNode {
    const sourceSemantics = this.getSemantics(sourceFormat);
    const targetSemantics = this.getSemantics(targetFormat);
    
    // Convert to semantic representation
    const semantic = this.toSemantic(node, sourceSemantics);
    
    // Convert from semantic to target format
    return this.fromSemantic(semantic, targetSemantics);
  }
  
  /**
   * Transform entire message between formats
   */
  transformMessage(
    message: Message,
    sourceFormat: FormatType,
    targetFormat: FormatType
  ): Message {
    const transformedData = this.transform(message.data, sourceFormat, targetFormat);
    
    return {
      ...message,
      data: transformedData,
      metadata: {
        ...message.metadata,
        transformation: {
          sourceFormat,
          targetFormat,
          transformedAt: new Date().toISOString()
        }
      }
    };
  }
  
  /**
   * Get registered semantics for format
   */
  getSemantics(format: FormatType): FormatSemantics {
    const semantics = this.semanticsRegistry.get(format);
    if (!semantics) {
      throw new Error(`No semantics registered for format: ${format}`);
    }
    return semantics;
  }
  
  /**
   * Convert FNode to semantic representation
   */
  private toSemantic(node: FNode, semantics: FormatSemantics): SemanticNode {
    const role = semantics.typeToRole.get(node.type) || SemanticRole.VALUE;
    
    return {
      role,
      name: node.name,
      value: node.value,
      id: node.id,
      ns: node.ns,
      label: node.label,
      children: node.children?.map(child => this.toSemantic(child, semantics)),
      parents: node.parents?.map(parent => this.toSemantic(parent, semantics)),
      attributes: node.attributes?.map(attr => this.toSemantic(attr, semantics))
    };
  }
  
  /**
   * Convert semantic representation to FNode
   */
  private fromSemantic(semantic: SemanticNode, semantics: FormatSemantics): FNode {
    const targetType = semantics.roleToType.get(semantic.role) || FNodeType.VALUE;
    
    // Apply transformation rules based on semantic role
    const transformedChildren = this.applyTransformationRules(
      semantic.children || [],
      semantics
    );
    
    const transformedAttributes = this.applyAttributeTransformationRules(
      semantic.attributes || [],
      semantics
    );
    
    return {
      type: targetType,
      name: semantic.name,
      value: semantic.value,
      id: semantic.id,
      ns: semantic.ns,
      label: semantic.label,
      children: transformedChildren,
      parents: semantic.parents?.map(parent => this.fromSemantic(parent, semantics)),
      attributes: transformedAttributes
    };
  }
  
  /**
   * Apply transformation rules to child nodes
   */
  private applyTransformationRules(
    children: SemanticNode[],
    semantics: FormatSemantics
  ): FNode[] {
    const result: FNode[] = [];
    
    for (const child of children) {
      const strategy = this.getTransformationStrategy(child.role, semantics);
      
      switch (strategy) {
        case TransformationStrategy.PRESERVE:
          result.push(this.fromSemantic(child, semantics));
          break;
          
        case TransformationStrategy.CONVERT:
          result.push(this.fromSemantic(child, semantics));
          break;
          
        case TransformationStrategy.FLATTEN:
          // Flatten child's children into current level
          if (child.children) {
            result.push(...this.applyTransformationRules(child.children, semantics));
          }
          break;
          
        case TransformationStrategy.PROMOTE:
          // Convert to metadata or annotation
          const promotedNode = this.fromSemantic(child, semantics);
          promotedNode.type = FNodeType.COMMENT;
          result.push(promotedNode);
          break;
          
        case TransformationStrategy.DEMOTE:
          // Convert to attribute or lower-level element
          const demotedNode = this.fromSemantic(child, semantics);
          demotedNode.type = FNodeType.ATTRIBUTES;
          result.push(demotedNode);
          break;
          
        case TransformationStrategy.DROP:
          // Skip this node entirely
          break;
          
        default:
          result.push(this.fromSemantic(child, semantics));
      }
    }
    
    return result;
  }
  
  /**
   * Apply transformation rules to attribute nodes
   */
  private applyAttributeTransformationRules(
    attributes: SemanticNode[],
    semantics: FormatSemantics
  ): FNode[] | undefined {
    if (attributes.length === 0) return undefined;
    
    const strategy = semantics.transformationRules.attributes;
    
    switch (strategy) {
      case TransformationStrategy.PRESERVE:
        return attributes.map(attr => this.fromSemantic(attr, semantics));
        
      case TransformationStrategy.CONVERT:
        // Convert attributes to fields/properties
        return attributes.map(attr => ({
          ...this.fromSemantic(attr, semantics),
          type: FNodeType.FIELD
        }));
        
      case TransformationStrategy.DROP:
        return undefined;
        
      default:
        return attributes.map(attr => this.fromSemantic(attr, semantics));
    }
  }
  
  /**
   * Get transformation strategy for a semantic role
   */
  private getTransformationStrategy(
    role: SemanticRole,
    semantics: FormatSemantics
  ): TransformationStrategy {
    switch (role) {
      case SemanticRole.CONTAINER:
        return semantics.transformationRules.collections;
      case SemanticRole.ITEM:
        return semantics.transformationRules.records;
      case SemanticRole.METADATA:
        return semantics.transformationRules.attributes;
      case SemanticRole.ANNOTATION:
        return semantics.transformationRules.comments;
      default:
        return TransformationStrategy.PRESERVE;
    }
  }
  
  /**
   * Check if two formats are compatible for transformation
   */
  isCompatible(sourceFormat: FormatType, targetFormat: FormatType): boolean {
    try {
      const sourceSemantics = this.getSemantics(sourceFormat);
      const targetSemantics = this.getSemantics(targetFormat);
      
      // Basic compatibility check - both formats support similar semantic roles
      const sourceRoles = new Set(sourceSemantics.typeToRole.values());
      const targetRoles = new Set(targetSemantics.roleToType.keys());
      
      // Check if target format can represent core source roles
      const coreRoles = [SemanticRole.CONTAINER, SemanticRole.ITEM, SemanticRole.VALUE];
      return coreRoles.every(role => 
        !sourceRoles.has(role) || targetRoles.has(role)
      );
    } catch {
      return false;
    }
  }
  
  /**
   * Get list of registered format types
   */
  getSupportedFormats(): FormatType[] {
    return Array.from(this.semanticsRegistry.keys());
  }
}