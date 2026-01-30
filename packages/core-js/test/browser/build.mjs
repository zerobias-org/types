#!/usr/bin/env node
/**
 * Browser bundle build script
 * Bundles the test imports for browser and reports any warnings/errors
 */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('=== Browser Bundle Test ===\n');
console.log('Bundling types-core-js for browser...\n');

const warnings = [];
const errors = [];

try {
  const result = await esbuild.build({
    entryPoints: [join(__dirname, 'imports.ts')],
    bundle: true,
    outfile: join(__dirname, 'bundle.js'),
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    minify: false,
    metafile: true,
    logLevel: 'warning',
    // Don't mark anything as external - we want to see all bundling issues
    external: [],
    // Capture warnings
    plugins: [{
      name: 'warning-capture',
      setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
          // Log module resolution for debugging
          if (args.kind === 'import-statement' && !args.path.startsWith('.')) {
            console.log(`  Resolving: ${args.path}`);
          }
          return null;
        });
      }
    }]
  });

  // Analyze the bundle
  const text = await esbuild.analyzeMetafile(result.metafile, { verbose: true });

  console.log('\n=== Bundle Analysis ===\n');
  console.log(text);

  // Check for warnings
  if (result.warnings.length > 0) {
    console.log('\n=== Bundler Warnings ===\n');
    for (const warning of result.warnings) {
      console.log(`⚠️  ${warning.text}`);
      if (warning.location) {
        console.log(`   at ${warning.location.file}:${warning.location.line}`);
      }
      warnings.push(warning);
    }
  }

  // Check for errors
  if (result.errors.length > 0) {
    console.log('\n=== Bundler Errors ===\n');
    for (const error of result.errors) {
      console.log(`❌ ${error.text}`);
      if (error.location) {
        console.log(`   at ${error.location.file}:${error.location.line}`);
      }
      errors.push(error);
    }
  }

  // Output stats
  const outputs = Object.entries(result.metafile.outputs);
  const mainOutput = outputs.find(([k]) => k.endsWith('bundle.js'));
  if (mainOutput) {
    const [, meta] = mainOutput;
    console.log(`\n=== Bundle Stats ===`);
    console.log(`Size: ${(meta.bytes / 1024).toFixed(2)} KB`);
    console.log(`Inputs: ${Object.keys(meta.inputs).length} files`);
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Errors: ${errors.length}`);

  if (warnings.length === 0 && errors.length === 0) {
    console.log('\n✅ Bundle created successfully with no issues!');
    console.log(`\nTo test in browser, open: ${join(__dirname, 'index.html')}`);
  } else {
    console.log('\n⚠️  Bundle created with issues - review warnings above');
  }

  process.exit(errors.length > 0 ? 1 : 0);

} catch (err) {
  console.error('\n❌ Bundle failed!\n');
  console.error(err);
  process.exit(1);
}
