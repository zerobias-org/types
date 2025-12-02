# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

This is the **ZeroBias Types Monorepo** (`@zerobias-org/types`) - a collection of TypeScript type definitions and implementations for the ZeroBias/Auditmation platform. The repository provides core types, cloud provider types (AWS, Azure, GCP), and related utilities.

**Repository Role:** Foundation type system - provides type definitions, validation, and serialization for the platform ecosystem.

## Repository Structure

```
types/
├── packages/
│   ├── core-typedefs/        # @zerobias-org/types-core - OpenAPI schema definitions
│   ├── core-js/              # @zerobias-org/types-core-js - TypeScript implementations
│   ├── amazon-typedefs/      # @zerobias-org/types-amazon - AWS type schemas
│   ├── amazon-js/            # @zerobias-org/types-amazon-js - AWS type implementations
│   ├── google-typedefs/      # @zerobias-org/types-google - GCP type schemas
│   ├── google-js/            # @zerobias-org/types-google-js - GCP type implementations
│   ├── microsoft-typedefs/   # @zerobias-org/types-microsoft - Azure type schemas
│   ├── microsoft-js/         # @zerobias-org/types-microsoft-js - Azure type implementations
│   ├── atlassian-typedefs/   # @zerobias-org/types-atlassian - Atlassian type schemas
│   └── format-spectral-ruleset/ # @zerobias-org/types-format-spectral-ruleset - Spectral linting rules
├── package.json              # Root workspace configuration
├── tsconfig.json             # Shared TypeScript configuration
├── nx.json                   # Nx build orchestration
├── lerna.json                # Lerna monorepo configuration
└── .github/                  # CI/CD workflows
```

## Common Commands

### Root Level Commands
```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Build specific package
npx lerna run build --scope=@zerobias-org/types-core-js

# Run tests across all packages
npm test

# Run tests for specific package
npx lerna run test --scope=@zerobias-org/types-core-js

# Lint all packages
npm run lint

# Clean all build artifacts
npm run clean
```

### Package-Specific Commands
```bash
cd packages/core-js

# Build
npm run build

# Run tests
npm run test

# Generate code from OpenAPI schemas
npm run generate:code

# Lint
npm run lint
```

## ESM Migration

This repository has been migrated to **ES Modules (ESM)** with the following key changes:

### Configuration
- All packages use `"type": "module"` in package.json
- TypeScript configured with `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- Target is `ES2023` for modern JavaScript features
- Node.js engine requirement is `>=22.0.0`

### Import Patterns

#### ESM Imports with Extensions
All relative imports must include the `.js` extension:
```typescript
// Correct
import { CoreType } from './CoreType.js';
import { UUID } from './types/index.js';

// Incorrect (won't work in ESM)
import { CoreType } from './CoreType';
import { UUID } from './types';
```

#### JSON Imports
JSON files are imported using `createRequire` for ESM compatibility:
```typescript
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const typeDefs = require('@zerobias-org/types-core/data/types/types.json');
```

#### Package Imports
Cross-package dependencies use the new namespace:
```typescript
import { CoreType, TypeLibrary } from '@zerobias-org/types-core-js';
```

## Key Technologies

- **TypeScript 5.7+** - Primary language with ESM support
- **Node.js 22+** - Runtime environment
- **Lerna 9.x** - Monorepo management with independent versioning
- **Nx 20.x** - Build orchestration and caching
- **Mocha/Chai** - Testing framework
- **OpenAPI** - Type schema definitions

## Package Dependencies

### Core Packages
- `core-typedefs` → No dependencies (schema-only)
- `core-js` → Depends on `core-typedefs`

### Cloud Provider Packages
- `amazon-typedefs` → Depends on `core-typedefs`
- `amazon-js` → Depends on `amazon-typedefs`, `core-js`
- `google-typedefs` → Depends on `core-typedefs`
- `google-js` → Depends on `google-typedefs`, `core-js`
- `microsoft-typedefs` → Depends on `core-typedefs`
- `microsoft-js` → Depends on `microsoft-typedefs`, `core-js`
- `atlassian-typedefs` → Depends on `core-typedefs`

## Code Generation

The `-js` packages generate TypeScript code from OpenAPI schemas using `hub-generator`:

```bash
# Generate code for core-js
cd packages/core-js
npm run generate:code
```

Generated files are placed in `generated/` directories and should not be manually edited.

## Type System Architecture

### CoreType
The `CoreType` class provides programmatic access to type metadata:
```typescript
import { CoreType } from '@zerobias-org/types-core-js';

// List all available types
const types = CoreType.listTypes();

// Get a specific type
const ipType = CoreType.get('ipAddress');
console.log(ipType.description);
console.log(ipType.examples);
```

### TypeLibrary
`TypeLibrary` manages type registration and lookup:
```typescript
import { TypeLibrary } from '@zerobias-org/types-core-js';

// Libraries are automatically registered when vendor types are initialized
AmazonType.init();  // Registers AWS types
GoogleType.init();  // Registers GCP types
MicrosoftType.init();  // Registers Azure types
```

### StringFormat Types
Custom string format types (like UUID, Email, URL) extend `StringFormat`:
```typescript
import { UUID } from '@zerobias-org/types-core-js';

const id = await UUID.parse('550e8400-e29b-41d4-a716-446655440000');
console.log(id.toString());
```

### Error Classes
Well-defined errors for consistent error handling:
```typescript
import { InvalidInputError, NoSuchObjectError } from '@zerobias-org/types-core-js';

throw new InvalidInputError('email', 'not-an-email', Email.examples());
```

## Testing

### Running Tests
```bash
# All packages
npm test

# Specific package
cd packages/core-js && npm test

# Watch mode
npm run test:watch
```

### Test Structure
Tests are located in `test/` directories within each package:
- `test/unit/` - Unit tests
- `test/` - Integration tests (for vendor packages)

## Namespace Migration

This repository was migrated from `@auditmation/*` to `@zerobias-org/*`:

| Old Package | New Package |
|-------------|-------------|
| `@auditmation/types-core` | `@zerobias-org/types-core` |
| `@auditmation/types-core-js` | `@zerobias-org/types-core-js` |
| `@auditmation/types-amazon` | `@zerobias-org/types-amazon` |
| `@auditmation/types-amazon-js` | `@zerobias-org/types-amazon-js` |
| `@auditmation/types-google` | `@zerobias-org/types-google` |
| `@auditmation/types-google-js` | `@zerobias-org/types-google-js` |
| `@auditmation/types-microsoft` | `@zerobias-org/types-microsoft` |
| `@auditmation/types-microsoft-js` | `@zerobias-org/types-microsoft-js` |
| `@auditmation/types-atlassian` | `@zerobias-org/types-atlassian` |

## Publishing

Packages are published to GitHub Package Registry:

```bash
# Publish all changed packages
npm run lerna:publish

# Version packages
npm run lerna:version
```

## Best Practices

### Adding New Types
1. Define the type schema in the appropriate `-typedefs` package
2. Implement the type class in the corresponding `-js` package
3. Export from `index.ts`
4. Add unit tests
5. Update type registrations if needed

### ESM Compatibility
- Always use `.js` extensions in imports
- Use `createRequire` for JSON imports
- Avoid CommonJS patterns (`require`, `module.exports`)
- Use `import.meta.url` instead of `__dirname`

### Error Handling
- Use provided error classes (InvalidInputError, etc.)
- Include helpful examples in error messages
- Serialize errors properly for API responses

## Related Documentation

- **TypeScript ESM**: https://www.typescriptlang.org/docs/handbook/esm-node.html
- **Lerna**: https://lerna.js.org/
- **Nx**: https://nx.dev/
