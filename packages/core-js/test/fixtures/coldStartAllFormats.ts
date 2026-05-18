// Import from compiled dist: the child process spawns with a fresh tsx
// loader, and tsx's ESM handling of TypeScript-only exports (e.g. the
// `interface` re-export in src/errors/index.ts) can throw during evaluation
// in a child context even though mocha's parent process loads it fine.
// Using the built JS avoids that and tests the actually-shipped artifact.
import { CoreType } from '../../dist/src/CoreType.js';

const formats = CoreType.allFormats();
if (!Array.isArray(formats) || formats.length === 0 || !formats.includes('date-time')) {
  console.error('FAIL: allFormats() returned an empty/incomplete list on cold start. Got:', JSON.stringify(formats));
  process.exit(1);
}
console.log('OK');
