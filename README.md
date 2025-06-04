# PipeFitter

A minimal, extensible fluent API framework for pipeline processing. Inspired by Apache Camel and functional programming principles.

## Features

- **Immutable Message Flow** - Each operation returns a new message instance
- **Event-driven Adapters** - Lifecycle management with start/stop capabilities  
- **Single-depth Branching** - Branch and merge with format-aware strategies
- **Extension System** - Register methods with configuration management
- **Resource Management** - Automatic cleanup and lifecycle coordination
- **Replaceable Logger** - Simple interface compatible with any logging library
- **TypeScript Support** - Full type definitions and module augmentation

## Quick Start

### Installation

```bash
npm install pipefitter
```

### Basic Usage

```typescript
import { PipeFitter, StringAdapter, JsonAdapter } from 'pipefitter';

// Simple pipeline - Clean and readable!
const result = new PipeFitter()
  .from(StringAdapter.input('{"name": "John"}'))
  .map(msg => ({ ...msg, data: JSON.parse(msg.data) }))
  .filter(msg => msg.data.name === 'John')
  .to(StringAdapter.console());
```

### Object Processing

```typescript
const userData = { 
  users: [
    { name: 'Alice', active: true },
    { name: 'Bob', active: false }
  ]
};

const activeUsers = new PipeFitter()
  .from(JsonAdapter.from(userData))
  .map(msg => ({ 
    ...msg, 
    data: msg.data.users.filter(user => user.active)
  }))
  .to(JsonAdapter.pretty());
```

## Core API

### Source Methods
- `from(adapter, options)` - Set pipeline source
- `from(object)` - Direct object input

### Processing Methods  
- `map(fn, hooks?)` - Transform messages
- `filter(predicate)` - Filter messages
- `find(predicate)` - Find first matching item
- `branch(predicate)` - Create conditional branch
- `merge(strategy)` - Merge branch back to parent

### Output Methods
- `to(adapter, options)` - Terminal operation with adapter

### Resource Management
- `startAdapters()` - Start all managed adapters
- `cleanup()` - Clean up all resources
- `registerCleanup(callback)` - Register custom cleanup

## Configuration

PipeFitter supports extension-based configuration management:

```typescript
// Basic configuration
const pipeline = new PipeFitter({
  logLevel: LogLevel.DEBUG
});

// Extension with configuration
PipeFitter.registerMethod('validate', validateMethod, {
  validation: {
    strict: false,
    required: ['id', 'name']
  }
});

// Use with custom config
const configured = new PipeFitter({
  validation: { strict: true }
});
```

## Built-in Adapters

### String Adapter

```typescript
import { StringAdapter } from 'pipefitter';

// String input - clean and clear!
pipeline.from(StringAdapter.input('Hello World'));

// String output with prefix
pipeline.to(StringAdapter.output({ prefix: 'Result: ' }));

// Console output
pipeline.to(StringAdapter.console('Debug: '));
```

### JSON Adapter

```typescript
import { JsonAdapter } from 'pipefitter';

// JSON from string
pipeline.from(JsonAdapter.parse('{"key": "value"}'));

// JSON from object
pipeline.from(JsonAdapter.from({ key: 'value' }));

// Pretty JSON output
pipeline.to(JsonAdapter.pretty(2));

// JSON with metadata
pipeline.to(JsonAdapter.output({ includeMetadata: true }));

// Console JSON output
pipeline.to(JsonAdapter.console());
```

## Branch and Merge

Single-depth branching with format-aware merge strategies:

```typescript
const result = new PipeFitter()
  .from(orderData)
  
  // Branch for high priority orders
  .branch(msg => msg.data.priority === 'high')
    .map(msg => addExpressProcessing(msg))
    .find(msg => msg.data.customer.vip)
    
  // Merge with custom strategy
  .merge((branch, parent) => {
    const format = branch.metadata.data?.format;
    
    if (format === 'application/json') {
      return {
        ...parent,
        data: {
          ...parent.data,
          expressOrders: branch.data
        }
      };
    }
    
    return parent;
  })
  
  .to(outputAdapter);
```

## Extensions

Create custom methods with configuration support:

```typescript
// Define configuration interface
interface CustomConfig {
  enabled: boolean;
  apiKey: string;
}

// Extend Configuration type
declare module 'pipefitter/core/configuration' {
  interface Configuration {
    custom?: CustomConfig;
  }
}

// Register extension
PipeFitter.registerMethod('customMethod', function(this: PipeFitter) {
  return this.map(msg => {
    const config = msg.context.config.custom!;
    
    if (config.enabled) {
      // Custom processing
      msg.data.processed = true;
    }
    
    return msg;
  });
}, {
  custom: {
    enabled: true,
    apiKey: 'default-key'
  } as CustomConfig
});

// Use extension
new PipeFitter({ custom: { apiKey: 'my-key' } })
  .from(data)
  .customMethod()
  .to(output);
```

## Resource Management

Automatic lifecycle management for adapters:

```typescript
class DatabaseAdapter implements Adapter {
  handle(message: Message, options: any): Message {
    // Process message
    return message;
  }
  
  start(): void {
    console.log('Opening database connection');
  }
  
  stop(): void {
    console.log('Closing database connection'); 
  }
}

const pipeline = new PipeFitter();

try {
  await pipeline.startAdapters(); // Calls start() on all adapters
  
  const result = await pipeline
    .from(dbAdapter, { query: 'SELECT * FROM users' })
    .to(outputAdapter);
    
} finally {
  await pipeline.cleanup(); // Calls stop() on all adapters
}
```

## Function Composition

Combine transformations with compose utility:

```typescript
import { compose } from 'pipefitter';

const complexTransform = compose(
  msg => addTimestamp(msg),
  msg => validateFields(msg, ['name', 'email']),
  msg => normalizeData(msg)
);

pipeline
  .from(data)
  .map(complexTransform)
  .to(output);
```

## Development

### Project Structure

```
pipefitter/
├── src/
│   ├── core/              # Core framework components
│   │   ├── message.ts     # Message interface
│   │   ├── context.ts     # Execution context
│   │   ├── adapter.ts     # Adapter interface
│   │   ├── configuration.ts # Config management
│   │   ├── resource-manager.ts # Resource lifecycle
│   │   ├── logger.ts      # Logging interface
│   │   └── pipefitter.ts  # Main class
│   ├── adapters/          # Built-in adapters
│   │   ├── string-adapter.ts
│   │   └── json-adapter.ts
│   ├── utils/
│   │   └── compose.ts     # Function composition
│   └── index.ts           # Main exports
├── examples/              # Usage examples
├── dist/                  # Built distributions
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
# Install dependencies
npm install

# Build ESM distribution
npm run build

# Development mode (watch)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Build Output

- `dist/` - ES Modules with TypeScript definitions
- Modern ESM-only build for Node.js 16+ and modern browsers
- Zero runtime dependencies
- Full TypeScript support

### Testing Examples

```bash
# Run all examples
npm run test:all

# Individual examples
npm run test           # Basic usage
npm run test:config    # Configuration
npm run test:resources # Resource management
npm run test:extensions # Extensions and branching
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests/examples
5. Submit a pull request

## Comparison to XJX

PipeFitter extracts the essential fluent API patterns from XJX into a general-purpose framework:

- **Simplified Message Structure** - Removed XML/JSON specific properties
- **Format Agnostic** - Works with any data format via adapters
- **Cleaner Configuration** - Simplified extension configuration system
- **Resource Management** - Added lifecycle management for production use
- **Single Responsibility** - Focused on pipeline processing, not format conversion

PipeFitter is not compatible with XJX but shares the same design philosophy of simplicity, consistency, and extensibility.