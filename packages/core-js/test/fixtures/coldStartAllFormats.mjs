// Plain .mjs (not .ts) so the package's tsconfig doesn't try to typecheck
// this file at build time — it imports from compiled dist output, which
// doesn't exist during the typecheck phase. The companion mocha test spawns
// this script in a fresh node process to verify that CoreType.allFormats()
// is populated on first call with no prior CoreType usage.
import { CoreType } from '../../dist/src/CoreType.js';

const formats = CoreType.allFormats();
if (!Array.isArray(formats) || formats.length === 0 || !formats.includes('date-time')) {
  console.error('FAIL: allFormats() returned an empty/incomplete list on cold start. Got:', JSON.stringify(formats));
  process.exit(1);
}
console.log('OK');
