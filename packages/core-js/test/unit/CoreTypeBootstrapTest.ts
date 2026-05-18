/* eslint-disable */
import { expect } from 'chai';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('CoreType bootstrap', function () {
  this.timeout(15000);

  it('allFormats() returns a populated list on cold start with no prior CoreType usage', function () {
    // CoreType.initialized is process-static, so we can't simulate a cold
    // start inside the current mocha process — earlier tests almost certainly
    // populated it. Spawn a fresh node + tsx invocation that touches *only*
    // CoreType.allFormats() before anything else.
    const fixture = resolve(__dirname, '../fixtures/coldStartAllFormats.mjs');
    const out = execFileSync(
      process.execPath,
      [fixture],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: resolve(__dirname, '../..') }
    );
    expect(out.trim()).to.equal('OK');
  });
});
