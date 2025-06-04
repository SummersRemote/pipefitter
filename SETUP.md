# PipeFitter Setup Instructions

## Project Creation

Follow these steps to create the PipeFitter project:

### 1. Create Project Structure

```bash
mkdir pipefitter
cd pipefitter

# Create source directories
mkdir -p src/core
mkdir -p src/adapters 
mkdir -p src/utils
mkdir -p examples

# Create build directories
mkdir -p dist
```

### 2. Initialize Package

```bash
npm init -y
```

### 3. Install Dependencies

```bash
# Development dependencies only (zero runtime dependencies!)
npm install --save-dev typescript @types/node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin rimraf
```

### 4. Copy Source Files

Copy all the source files from the artifacts:

```
src/
├── core/
│   ├── message.ts          # Message interface
│   ├── context.ts          # Execution context
│   ├── adapter.ts          # Adapter interface
│   ├── configuration.ts    # Config management
│   ├── resource-manager.ts # Resource lifecycle
│   ├── logger.ts           # Logging interface
│   └── pipefitter.ts       # Main class
├── adapters/
│   ├── string-adapter.ts   # String processing
│   └── json-adapter.ts     # JSON processing
├── utils/
│   └── compose.ts          # Function composition
└── index.ts                # Main exports
```

### 5. Copy Configuration Files

Copy the configuration files:

- `package.json` (updated ESM version)
- `tsconfig.json` (ESM-focused)
- `.eslintrc.json` (linting rules)
- `README.md` (documentation)

### 6. Copy Examples

Copy the example files to demonstrate usage:

- `examples/basic-usage.ts` (improved syntax)
- `examples/configuration.ts` 
- `examples/resource-management.ts`
- `examples/extensions.ts`

### 7. Build the Project

```bash
# Build TypeScript to ESM
npm run build

# Verify build output
ls -la dist/
```

Expected output structure:
```
dist/
├── core/
├── adapters/
├── utils/
├── index.js
├── index.d.ts
└── *.js.map files
```

### 8. Test the Examples

```bash
# Test basic usage (should run without errors)
npm run test

# Test all examples
npm run test:all
```

### 9. Verify Package Structure

```bash
# Check package exports
node -e "console.log(JSON.stringify(require('./package.json').exports, null, 2))"

# Test import in Node.js
node -e "import('./dist/index.js').then(m => console.log('Import successful:', Object.keys(m)))"
```

## Key Improvements Made

### 1. Cleaner API - No More Spread Operators!

**Before (clunky):**
```typescript
.from(...createStringInput('hello'))
.to(...createConsoleOutput())
```

**After (clean):**
```typescript
.from(StringAdapter.input('hello'))
.to(StringAdapter.console())
```

### 2. Fluent Builder Pattern

All adapters now use static factory methods:

```typescript
// String adapters
StringAdapter.input(text)
StringAdapter.output(options)
StringAdapter.console(prefix)

// JSON adapters  
JsonAdapter.parse(jsonString)
JsonAdapter.from(object)
JsonAdapter.pretty(indent)
JsonAdapter.console()
```

### 3. ESM-Only Build

- **Target:** ES2020 for modern Node.js (16+) and browsers
- **Format:** Pure ESM (no CommonJS/UMD complexity)
- **Dependencies:** Zero runtime dependencies
- **Size:** Minimal bundle size

### 4. Improved Developer Experience

- **Clearer intent:** `JsonAdapter.parse()` vs spread operator
- **Better autocomplete:** Static methods show available options
- **Type safety:** Full TypeScript support
- **No magic:** No hidden function calls or complex destructuring

## Browser Usage

### ES Modules (Recommended)

```html
<script type="module">
  import { PipeFitter, JsonAdapter } from './dist/index.js';
  
  const result = new PipeFitter()
    .from(JsonAdapter.from({ message: 'Hello Browser!' }))
    .to(JsonAdapter.console());
</script>
```

### CDN Usage

```html
<script type="module">
  import { PipeFitter, JsonAdapter } from 'https://unpkg.com/pipefitter/dist/index.js';
  // Use normally
</script>
```

## Node.js Usage

```javascript
// package.json must have "type": "module"
import { PipeFitter, StringAdapter, JsonAdapter } from 'pipefitter';

const pipeline = new PipeFitter()
  .from(StringAdapter.input('{"name": "Node.js"}'))
  .map(msg => ({ ...msg, data: JSON.parse(msg.data) }))
  .to(JsonAdapter.pretty());
```

## Troubleshooting

### TypeScript Module Resolution

If you encounter module resolution issues:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### Node.js ESM Issues

Ensure your package.json has:

```json
{
  "type": "module"
}
```

### Browser Module Issues

Ensure you're serving files with correct MIME types:
- `.js` files: `text/javascript`
- Use a local server, not `file://` protocol

## Development Workflow

1. **Make changes** to source files in `src/`
2. **Build** with `npm run build`
3. **Test** with `npm run test:all`
4. **Lint** with `npm run lint`
5. **Type check** with `npm run typecheck`

## Next Steps

1. **Add more adapters** (file, database, HTTP, etc.)
2. **Create extensions** with configuration support
3. **Add comprehensive testing** with your preferred test framework
4. **Publish to npm** when ready

The foundation is solid and extensible - build on it!