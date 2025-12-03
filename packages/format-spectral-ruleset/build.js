/**
 * Build script for format-spectral-ruleset
 *
 * This script generates type-data.json from the core-js package,
 * and creates a Spectral-compatible ruleset with inlined type data.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function build() {
  console.log('Loading CoreType from @zerobias-org/types-core-js...');

  // Dynamically import the built core-js
  const { CoreType } = await import('@zerobias-org/types-core-js');

  // Try to initialize vendor types to register their formats
  // These may not be available during initial build
  try {
    await import('@zerobias-org/types-amazon-js');
    console.log('Loaded amazon-js types');
  } catch (e) {
    console.log('Note: amazon-js not available');
  }

  try {
    await import('@zerobias-org/types-microsoft-js');
    console.log('Loaded microsoft-js types');
  } catch (e) {
    console.log('Note: microsoft-js not available');
  }

  try {
    await import('@zerobias-org/types-google-js');
    console.log('Loaded google-js types');
  } catch (e) {
    console.log('Note: google-js not available');
  }

  // Trigger initialization by calling get() with a known type
  // This ensures CoreTypeLibrary is loaded before accessing types
  try {
    CoreType.get('uuid');
  } catch (e) {
    // Type may not exist, but init() will have been called
  }

  const validTypes = CoreType.listTypes();
  const allFormats = CoreType.allFormats();

  // Build mapping of alternative formats to their canonical type names
  const formatToTypeName = {};
  for (const format of allFormats) {
    if (!validTypes.includes(format)) {
      const type = CoreType.get(format);
      if (type) {
        formatToTypeName[format] = type.name;
      }
    }
  }

  const typeData = {
    validTypes,
    allFormats,
    formatToTypeName,
    generatedAt: new Date().toISOString(),
  };

  // Save type-data.json
  const typeDataPath = join(__dirname, 'type-data.json');
  writeFileSync(typeDataPath, JSON.stringify(typeData, null, 2));

  // Generate Spectral ruleset with inlined type data
  // This avoids ESM import issues since all data is inlined
  mkdirSync(join(__dirname, 'dist'), { recursive: true });

  const rulesetContent = `/**
 * Auto-generated Spectral ruleset with inlined type data.
 * Generated at: ${typeData.generatedAt}
 *
 * DO NOT EDIT - regenerate with: npm run transpile
 */

// Inlined type data to avoid ESM/CJS issues with Spectral
const validTypes = ${JSON.stringify(validTypes)};
const allFormats = ${JSON.stringify(allFormats)};
const formatToTypeName = ${JSON.stringify(formatToTypeName)};
const ignoreList = ['binary'];

function checkFormat(target) {
  if (typeof target !== "object") {
    return [{ message: 'Value is not an object.' }];
  }

  if (typeof target.format !== "string"
    || validTypes.includes(target.format)
    || ignoreList.includes(target.format)
  ) {
    return [];
  }

  if (allFormats.includes(target.format)) {
    const typeName = formatToTypeName[target.format];
    return [{ message: \`\${target.format} is not permitted - use \${typeName} instead\` }];
  }
  return [{ message: \`unknown format: \${target.format}\` }];
}

export default {
  rules: {
    'valid-coretype-format': {
      severity: 'error',
      given: ['$..*[?(@ != null && @.format)]'],
      then: {
        function: checkFormat,
      },
    },
  },
};
`;

  const rulesetPath = join(__dirname, 'dist', 'ruleset.mjs');
  writeFileSync(rulesetPath, rulesetContent);

  console.log(`Generated type-data.json with ${validTypes.length} types and ${allFormats.length} formats`);
  console.log(`Generated dist/ruleset.mjs with inlined type data`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
