# PipeFitter

A minimal, extensible framework for building fluent APIs with format-neutral pipeline processing.

## Overview

PipeFitter provides a unified data representation (FNode) that enables seamless transformation between any structured data format while maintaining semantic consistency. It features a fluent API for building processing pipelines that work consistently across JSON, XML, CSV, and other data formats.

## Key Features

- **Format Neutrality**: Single data model works with JSON, XML, CSV, YAML, databases, etc.
- **Semantic Consistency**: Same operations produce consistent results across formats
- **Fluent API**: Readable, chainable operations with minimal cognitive overhead
- **Extensibility**: Plugin architecture for custom formats and operations
- **Type Safety**: Full TypeScript support with compile-time validation
- **Zero Dependencies**: Core framework has no external runtime dependencies

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PipeFitter Core                          │
├─────────────────────────────────────────────────────────────┤
│  Fluent API Layer                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ from() / to()│ │map()/filter()│ │branch()/merge()│      │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Semantic Layer                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Format       │ │Transformation│ │Format-Aware │          │
│  │Semantics    │ │Engine        │ │Operations   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Core Data Layer                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │FNode        │ │Message      │ │Context      │          │
│  │(Pure Data)  │ │(Processing) │ │(Execution)  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Installation

```bash
npm install pipefitter
```

### Basic Usage

```typescript
import { PipeFitter, createFNode, FNodeType } from 'pipefitter';

// Create sample data
const userData = createFNode(FNodeType.COLLECTION, 'users');

// Build processing pipeline
const pipeline = new PipeFitter()
  .from(userData)
  .map(msg => {
    // Transform data
    return enhanceUserData(msg);
  })
  .filter(msg => isActiveUser(msg))
  .to(outputAdapter);
```

### Semantic Operations

```typescript
import { 
  TransformationEngine, 
  FormatAwareOperations,
  FormatType,
  JSON_SEMANTICS,
  CSV_SEMANTICS 
} from 'pipefitter';

// Setup semantic layer
const engine = new TransformationEngine();
engine.register(JSON_SEMANTICS);
engine.register(CSV_SEMANTICS);

const operations = new FormatAwareOperations(engine);

// Process data in format-aware manner
const pipeline = new PipeFitter()
  .from(jsonData)
  .map(msg => {
    // Filter active users using format-aware operations
    return operations.filter(
      msg,
      user => operations.extractValue(user, 'active', FormatType.JSON) === true,
      FormatType.JSON
    );
  })
  .map(msg => {
    // Transform to CSV format
    return engine.transformMessage(msg, FormatType.JSON, FormatType.CSV);
  })
  .to(csvOutputAdapter);
```

### Cross-Format Processing

```typescript
// Same processing logic works across different input formats
async function processUserData(inputData: any, inputFormat: FormatType) {
  const pipeline = new PipeFitter()
    .from(parseFormat(inputData, inputFormat))
    
    // Format-aware filtering - works the same regardless of input format
    .map(msg => operations.filter(
      msg,
      user => operations.extractValue(user, 'active', inputFormat) === true,
      inputFormat
    ))
    
    // Business logic transformation
    .map(msg => enrichUserData(msg))
    
    // Output in desired format
    .map(msg => engine.transformMessage(msg, inputFormat, FormatType.JSON))
    .to(JsonAdapter.output());
    
  return pipeline;
}

// Works with any supported format
const jsonResult = await processUserData(jsonData, FormatType.JSON);
const csvResult = await processUserData(csvData, FormatType.CSV);
const xmlResult = await processUserData(xmlData, FormatType.XML);
```

## Core Concepts

### FNode - Format-Neutral Data Structure

FNode is the core data representation that can express any structured data format:

```typescript
interface FNode {
  type: FNodeType;        // Semantic type (COLLECTION, RECORD, FIELD, VALUE)
  name: string;           // Element name
  value?: Primitive;      // Primitive value for leaf nodes
  children?: FNode[];     // Child elements
  attributes?: FNode[];   // Attributes/metadata
  // ... additional properties for namespaces, IDs, etc.
}
```

### Message - Processing Container

Messages wrap FNode data with processing metadata and execution context:

```typescript
interface Message {
  data: FNode;           // Pure data structure
  metadata: Record<string, Record<string, any>>;  // Processing metadata
  context: Context;      // Execution environment
}
```

### Semantic Layer

The semantic layer enables format-neutral operations by mapping format-specific structures to universal semantic roles:

- **Format Semantics**: Define how each format's elements map to semantic roles
- **Transformation Engine**: Converts between formats via semantic representation
- **Format-Aware Operations**: Provide consistent functional operations across formats

## API Reference

### PipeFitter Class

```typescript
class PipeFitter {
  from(source: FNode | Adapter): PipeFitter
  to<T>(target: Adapter): T | Promise<T>
  map(fn: (msg: Message) => Message): PipeFitter
  filter(predicate: (msg: Message) => boolean): PipeFitter
  find(predicate: (msg: Message) => boolean): PipeFitter
  branch(predicate: (msg: Message) => boolean): PipeFitter
  merge(strategy: (branch: Message, parent: Message) => Message): PipeFitter
}
```

### Format-Aware Operations

```typescript
class FormatAwareOperations {
  find(message: Message, predicate: (item: FNode) => boolean, format: FormatType): FNode[]
  filter(message: Message, predicate: (item: FNode) => boolean, format: FormatType): Message
  map<T>(message: Message, mapper: (item: FNode) => T, format: FormatType): T[]
  groupBy(message: Message, keyExtractor: (item: FNode) => string, format: FormatType): Map<string, FNode[]>
  // ... additional operations
}
```

### Transformation Engine

```typescript
class TransformationEngine {
  register(semantics: FormatSemantics): void
  transform(node: FNode, sourceFormat: FormatType, targetFormat: FormatType): FNode
  transformMessage(message: Message, sourceFormat: FormatType, targetFormat: FormatType): Message
  isCompatible(sourceFormat: FormatType, targetFormat: FormatType): boolean
}
```

## Extension System

PipeFitter supports extensions for custom formats and operations:

```typescript
import { ExtensionRegistry, Extension } from 'pipefitter';

const myExtension: Extension = {
  name: 'my-extension',
  version: '1.0.0',
  methods: [{
    name: 'customOperation',
    implementation: function(this: PipeFitter, options: any) {
      return this.map(msg => customTransform(msg, options));
    }
  }]
};

await ExtensionRegistry.register(myExtension);

// Use custom method
const result = new PipeFitter()
  .from(data)
  .customOperation({ setting: 'value' })
  .to(output);
```

## Implementation Status

### ✅ Implemented
- Core data structures (FNode, Message, Context)
- Fluent API with all major operations
- Semantic layer with format semantics
- Transformation engine for cross-format conversion
- Format-aware operations
- Extension system
- Function composition utilities
- TypeScript support with strict typing
- Resource management and cleanup

### 🔄 External Adapters (Separate Packages)
- JSON adapter
- CSV adapter  
- XML adapter
- Database adapters
- File system adapters

## Development

### Build

Build all formats (ESM, CommonJS, types, and bundles):
```bash
npm run build
```

Production build with optimizations:
```bash
npm run build:prod
```

Development mode with watch:
```bash
npm run build:watch
```

### Development Mode (TypeScript only)

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Project Structure

After building, the `dist/` directory contains:

```
dist/
├── esm/          # ES modules (import/export)
├── cjs/          # CommonJS modules (require/module.exports)  
├── types/        # TypeScript declaration files
└── bundle/       # Browser bundles
    ├── pipefitter.min.js     # UMD minified bundle
    └── pipefitter.esm.js     # ESM browser bundle
```

### Bundle Analysis

The build process includes bundle size analysis. File sizes are displayed after each build, including gzipped sizes for the minified bundles.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all contributions follow the project's principles of simplicity, consistency, and format neutrality.