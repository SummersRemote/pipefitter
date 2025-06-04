# Build System

PipeFitter uses Rollup for building multiple distribution formats to support different environments and use cases.

## Build Outputs

### ES Modules (`dist/esm/`)
- **Target**: Modern bundlers (Webpack, Vite, Rollup)
- **Format**: ES2020 with import/export statements
- **Tree-shaking**: Full support for optimal bundle sizes
- **Modules**: Preserved structure for granular imports

### CommonJS (`dist/cjs/`)
- **Target**: Node.js environments
- **Format**: CommonJS with require/module.exports
- **Compatibility**: Works with older Node.js versions
- **Modules**: Preserved structure for selective requiring

### TypeScript Declarations (`dist/types/`)
- **Target**: TypeScript projects
- **Content**: Type definitions (.d.ts files)
- **Source maps**: Included for better IDE experience
- **Structure**: Mirrors source structure for precise types

### Browser Bundles (`dist/bundle/`)

#### UMD Bundle (`pipefitter.min.js`)
- **Target**: Direct browser usage via `<script>` tag
- **Format**: Universal Module Definition (UMD)
- **Global**: Available as `window.PipeFitter`
- **Size**: Minified and compressed
- **Dependencies**: All bundled (zero external deps)

#### ESM Bundle (`pipefitter.esm.js`)
- **Target**: Modern browsers with ES modules
- **Format**: ES modules for `<script type="module">`
- **Size**: Unminified for development debugging
- **Source maps**: Included

## Build Scripts

```bash
# Development build with source maps
npm run build

# Production build (minified, no console logs)
NODE_ENV=production npm run build

# Watch mode for development
npm run build:watch

# Clean build artifacts
npm run clean
```

## Package.json Exports

The package provides conditional exports for different environments:

```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./semantic": {
      "types": "./dist/types/semantic/index.d.ts", 
      "import": "./dist/esm/semantic/index.js",
      "require": "./dist/cjs/semantic/index.js"
    }
  }
}
```

## Bundle Analysis

Each build includes file size analysis:

- **Raw size**: Uncompressed bundle size
- **Minified size**: After minification (production builds)
- **Gzipped size**: Compressed size (what users download)

## Tree Shaking

All builds support tree shaking to minimize bundle sizes:

```javascript
// Import only what you need
import { PipeFitter, FormatType } from 'pipefitter';

// Or import specific modules
import { TransformationEngine } from 'pipefitter/semantic';
```

## Browser Compatibility

- **ESM builds**: Modern browsers with ES2020 support
- **UMD bundle**: IE11+ with polyfills
- **Node.js**: v16+ for ESM, v12+ for CommonJS

## Development vs Production

### Development
- Source maps included
- Unminified code for debugging
- Console logs preserved

### Production  
- Minified and optimized
- Console logs removed
- No source maps (smaller bundles)
- Dead code elimination