# PipeFitter Development Setup

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start development mode**:
   ```bash
   npm run build:watch
   ```

## Project Structure

```
pipefitter/
├── src/                    # Source code
│   ├── core/              # Core PipeFitter functionality
│   ├── semantic/          # Format semantics and transformations
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── examples/              # Usage examples
├── docs/                  # Documentation
├── dist/                  # Build outputs (generated)
├── rollup.config.js       # Build configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Development Workflow

### 1. Code Changes
Make changes to TypeScript files in `src/`

### 2. Build
```bash
# Development build
npm run build

# Production build  
npm run build:prod

# Watch mode (rebuilds on changes)
npm run build:watch
```

### 3. Testing
```bash
# Run examples
node examples/semantic-operations.js

# Lint code
npm run lint
```

### 4. Clean Build
```bash
npm run clean && npm run build
```

## Dependencies

### Runtime
- **Zero dependencies** - PipeFitter core has no external runtime dependencies

### Development
- **TypeScript** - Language and type system
- **Rollup** - Build system and bundler
- **ESLint** - Code linting and style
- **Rimraf** - Cross-platform file deletion

### Rollup Plugins
- `@rollup/plugin-typescript` - TypeScript compilation
- `@rollup/plugin-node-resolve` - Dependency resolution
- `@rollup/plugin-commonjs` - CommonJS compatibility
- `@rollup/plugin-terser` - Code minification
- `rollup-plugin-filesize` - Bundle size analysis

## Build Outputs

The build process creates multiple formats:

- **ESM** (`dist/esm/`) - For modern bundlers
- **CommonJS** (`dist/cjs/`) - For Node.js
- **Types** (`dist/types/`) - TypeScript declarations
- **Bundles** (`dist/bundle/`) - Browser-ready files

## IDE Setup

### VS Code
Recommended extensions:
- TypeScript and JavaScript Language Features (built-in)
- ESLint
- Prettier (optional)

### Configuration
The project includes:
- `.vscode/` settings (if present)
- ESLint configuration
- TypeScript strict mode enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following existing patterns
4. Ensure builds pass: `npm run build`
5. Ensure linting passes: `npm run lint`
6. Submit a pull request

## Troubleshooting

### Build Errors
- Run `npm run clean` then `npm run build`
- Check TypeScript version compatibility
- Verify all dependencies installed

### Import/Export Issues
- Ensure `.js` extensions in import paths
- Check `package.json` exports configuration
- Verify build output structure

### TypeScript Errors
- Check `tsconfig.json` configuration
- Ensure proper import/export syntax
- Verify type definitions are available