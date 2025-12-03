/**
 * Redocly plugin for ZeroBias types validation
 *
 * This plugin validates OpenAPI schemas against ZeroBias type conventions.
 * The valid formats list is generated at build time from core-js.
 */

// Import the generated type data (created by build script)
import typeData from './type-data.json' with { type: 'json' };

const { validTypes, allFormats, formatToTypeName } = typeData;
const ignoreList = ['binary'];

/**
 * Custom rule to validate that format values use the canonical type name
 */
const ValidCoreTypeFormat = () => {
  return {
    Schema(schema, { report, location }) {
      if (!schema.format || typeof schema.format !== 'string') {
        return;
      }

      const format = schema.format;

      // Check if it's a valid type name or ignored
      if (validTypes.includes(format) || ignoreList.includes(format)) {
        return;
      }

      // Check if it's an alternative format that should use the canonical name
      if (allFormats.includes(format)) {
        const typeName = formatToTypeName[format];
        report({
          message: `Format "${format}" is not permitted - use "${typeName}" instead`,
          location: location.child(['format']),
        });
        return;
      }

      // Unknown format
      report({
        message: `Unknown format: "${format}"`,
        location: location.child(['format']),
      });
    },
  };
};

/**
 * Rule to ensure property names are in camelCase
 */
const PropertyNamesCamelCase = () => {
  const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

  return {
    Schema(schema, { report, location }) {
      if (!schema.properties) {
        return;
      }

      for (const propName of Object.keys(schema.properties)) {
        if (!camelCaseRegex.test(propName)) {
          report({
            message: `Property name "${propName}" should be in camelCase`,
            location: location.child(['properties', propName]).key(),
          });
        }
      }
    },
  };
};

/**
 * Rule to ensure properties have descriptions
 */
const PropertiesMustHaveDescriptions = () => {
  return {
    Schema(schema, { report, location }) {
      if (!schema.properties) {
        return;
      }

      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (!propSchema.description) {
          report({
            message: `Property "${propName}" should have a description`,
            location: location.child(['properties', propName]),
            severity: 'warn',
          });
        }
      }
    },
  };
};

/**
 * Rule to ensure types have descriptions
 */
const TypeMustHaveDescription = () => {
  return {
    Schema(schema, { report, location }) {
      // Only check top-level schemas (those with a title or in components)
      if (schema.title && !schema.description) {
        report({
          message: `Type "${schema.title}" should have a description`,
          location: location,
          severity: 'warn',
        });
      }
    },
  };
};

/**
 * Rule to ensure enum values are in snake_case
 */
const EnumsMustBeSnakeCase = () => {
  const snakeCaseRegex = /^[a-z][a-z0-9_]*$/;

  return {
    Schema(schema, { report, location }) {
      if (!schema.enum || !Array.isArray(schema.enum)) {
        return;
      }

      for (let i = 0; i < schema.enum.length; i++) {
        const value = schema.enum[i];
        if (typeof value === 'string' && !snakeCaseRegex.test(value)) {
          report({
            message: `Enum value "${value}" should be in snake_case`,
            location: location.child(['enum', i]),
          });
        }
      }
    },
  };
};

export default {
  id: 'zerobias-types',
  rules: {
    oas3: {
      'valid-coretype-format': ValidCoreTypeFormat,
      'property-names-camel-case': PropertyNamesCamelCase,
      'properties-must-have-descriptions': PropertiesMustHaveDescriptions,
      'type-must-have-description': TypeMustHaveDescription,
      'enums-must-be-snake-case': EnumsMustBeSnakeCase,
    },
    oas2: {
      'valid-coretype-format': ValidCoreTypeFormat,
      'property-names-camel-case': PropertyNamesCamelCase,
      'properties-must-have-descriptions': PropertiesMustHaveDescriptions,
      'type-must-have-description': TypeMustHaveDescription,
      'enums-must-be-snake-case': EnumsMustBeSnakeCase,
    },
  },
  configs: {
    recommended: {
      rules: {
        'zerobias-types/valid-coretype-format': 'error',
        'zerobias-types/property-names-camel-case': 'error',
        'zerobias-types/properties-must-have-descriptions': 'warn',
        'zerobias-types/type-must-have-description': 'warn',
        'zerobias-types/enums-must-be-snake-case': 'error',
      },
    },
  },
};
