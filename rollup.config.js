// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import { readFileSync } from "fs";
import terser from "@rollup/plugin-terser";

// Read package.json for external dependencies
const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const isProd = process.env.NODE_ENV === "production";

// Treat all deps and peerDeps as external
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Common plugins for all builds
const commonPlugins = [
  nodeResolve({
    browser: true,
    extensions: [".ts", ".js"],
  }),
  commonjs(),
  filesize(),
];

// Define configs
export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      dir: "dist/esm",
      format: "es",
      sourcemap: !isProd,
      preserveModules: true,
      preserveModulesRoot: "src",
      exports: "named",
    },
    external,
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: "dist/esm",
        rootDir: "src",
      }),
    ],
    treeshake: {
      moduleSideEffects: "no-external",
      preset: "recommended",
    },
  },

  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: !isProd,
      preserveModules: true,
      preserveModulesRoot: "src",
      exports: "named",
    },
    external,
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        outDir: "dist/cjs",
        rootDir: "src",
      }),
    ],
    treeshake: {
      moduleSideEffects: "no-external",
      preset: "recommended",
    },
  },

  // Declaration files build
  {
    input: "src/index.ts",
    output: {
      dir: "dist/types",
      format: "es",
      preserveModules: true,
      preserveModulesRoot: "src",
      sourcemap: true,
    },
    external,
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationMap: true,
        emitDeclarationOnly: true,
        outDir: "dist/types",
        rootDir: "src",
      }),
    ],
  },

  // Minified browser bundle
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle/pipefitter.min.js",
      format: "umd",
      name: "PipeFitter",
      sourcemap: false,
    },
    external: [], // Bundle everything for browser
    plugins: [
      nodeResolve({ 
        browser: true,
        extensions: [".ts", ".js"] 
      }),
      commonjs(),
      typescript({ 
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
        },
        mangle: {
          reserved: ['PipeFitter'],
        },
      }),
      filesize({ 
        showMinifiedSize: true, 
        showGzippedSize: true 
      }),
    ],
  },

  // ESM browser bundle (unminified for development)
  {
    input: "src/index.ts",
    output: {
      file: "dist/bundle/pipefitter.esm.js",
      format: "es",
      sourcemap: true,
    },
    external: [], // Bundle everything
    plugins: [
      nodeResolve({ 
        browser: true,
        extensions: [".ts", ".js"] 
      }),
      commonjs(),
      typescript({ 
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
      filesize(),
    ],
  },
];