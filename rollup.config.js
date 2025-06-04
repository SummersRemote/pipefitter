import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browsers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/pipefitter.js',
      format: 'umd',
      name: 'PipeFitter',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        target: 'es5',
        module: 'esnext',
        declaration: false,
        sourceMap: true,
        exclude: ['examples/**/*', '**/*.test.ts', '**/*.spec.ts']
      })
    ]
  },
  
  // UMD minified build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/pipefitter.min.js',
      format: 'umd',
      name: 'PipeFitter',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        target: 'es5',
        module: 'esnext',
        declaration: false,
        sourceMap: true,
        exclude: ['examples/**/*', '**/*.test.ts', '**/*.spec.ts']
      }),
      terser({
        compress: {
          drop_console: true
        },
        format: {
          comments: false
        }
      })
    ]
  }
];