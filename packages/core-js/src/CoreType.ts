import { IllegalArgumentError } from './errors/IllegalArgumentError.js';
import { NoSuchObjectError } from './errors/NoSuchObjectError.js';
import { TypeLibrary } from './TypeLibrary.js';
import { Type } from '../generated/model/index.js';
import { CoreTypeLibrary } from './CoreTypeLibrary.js';
import { UnexpectedError } from './errors/UnexpectedError.js';

/**
 * Returns whether the current ref is a reference to the document's top level.
 * There is currently only one coretype utilizing this. (x509Certificate's certificate chain)
 * @param ref
 * @returns
 */
const isTopLevelRef = (ref: string): boolean => ref === '#';

const defaultSchema = (name: string): { name: string, schema: unknown; } => ({
  name,
  schema: {},
});

/**
 * Merges the given schemas as follows:
 * * `type` is assumed to be `object`
 * * `required` properties are concatenated
 * * `properties` of both schemas are added to the resulting schema.
 * Any other top level properties are ignored.
 * @param schema1
 * @param schema2
 * @returns
 */
const mergeSchemas = (schema1: any, schema2: any): any => ({
  type: 'object',
  required: [
    ...schema1.required || [],
    ...schema2.required || [],
  ],
  properties: {
    ...schema1.properties,
    ...schema2.properties,
  },
});

export class CoreType {
  private static initialized = false;

  private static typeNames: Array<string> = [];

  private static types: Record<string, CoreType> = {};

  private type!: Type;

  private library: TypeLibrary;

  private _schema?: Record<string, unknown>;

  static get(typeName: string): CoreType {
    CoreType.init();
    if (CoreType.types[typeName]) {
      return CoreType.types[typeName];
    }
    throw new NoSuchObjectError('CoreType', typeName);
  }

  private static find(ref: string): CoreType {
    const parts = (ref).split('/');
    const name = parts.at(-1)!;
    const typeName = name.endsWith('.yml')
      ? name.replace('.yml', '')
      : `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
    try {
      return CoreType.get(typeName);
     
    } catch (e) {}

    const type = Object.values(CoreType.types)
      .find((t) => {
        // vendor types are prefixed by their vendor/suite.
        // i.e. typeName: awsAccessPolicyStatement, filename and refs: aws/accessPolicyStatement
        if (name.toLowerCase().endsWith(t.name.toLowerCase()) && t.path) {
          const pathParts = t.path.split('/');
          let full = `${pathParts.at(-2)}${pathParts.at(-1)}`;
          full = full.replace('.yml', '');
          if (full.toLowerCase() === name.toLowerCase()) {
            return t;
          }
        }
        return null;
      });

    if (type) {
      return type;
    }
    throw new NoSuchObjectError('CoreType', typeName);
  }

  static loadTypeLibrary(library: TypeLibrary) {
    for (const tn of library.typeNames
      .filter((tn) => !CoreType.typeNames.includes(tn))) CoreType.typeNames.push(tn);
    for (const k of Object.keys(library.types)
      .filter((k) => !CoreType.types[k])) { CoreType.types[k] = new CoreType(library.types[k], library); }
  }

  /**
     * List all supported type names.
     */
  static listTypes(): Array<string> {
    return [...CoreType.typeNames];
  }

  /**
   * Returns all valid values for the `format` field. This is a superset of {@link #listTypes()}
   */
  static allFormats(): Array<string> {
    return Object.keys(CoreType.types);
  }

  private static init() {
    if (CoreType.initialized) {
      return;
    }
    CoreType.loadTypeLibrary(new CoreTypeLibrary());
    CoreType.initialized = true;
  }

  /**
   * @param type the underlying type
   * @param library the library this type belongs to
   */
  private constructor(type: Type, library: TypeLibrary) {
    this.type = type;
    this.library = library;
  }

  get name(): string {
    return this.type.name;
  }

  get formats(): Array<string> {
    return this.type.formats || [];
  }

  get jsonType(): Type.JsonTypeEnumDef {
    return this.type.jsonType;
  }

  get isEnum(): boolean {
    return this.type.isEnum || false;
  }

  get hasExtendedInfo(): boolean {
    return this.type.extendedInfoType !== undefined;
  }

  get description(): string {
    return this.type.description;
  }

  get pattern(): string | undefined {
    return this.type.pattern;
  }

  get examples(): Array<any> {
    return this.type.examples;
  }

  get path(): string | undefined {
    return this.type.path;
  }

  get htmlInput(): Type.HtmlInputEnumDef {
    return this.type.htmlInput || 'text';
  }

  get enumMembers(): Array<{
    key: string,
    value: string,
    description?: string;
  }> {
    if (this.isEnum) {
      return this.library.listEnumMembers(this.type.name);
    }
    return [];
  }

  /**
   * @returns all enum keys IF the core type is an enum. Returns an empty array otherwise.
   */
  get enumKeys(): Array<string> {
    if (this.isEnum) {
      return this.library.getEnumKeys(this.type.name);
    }
    return [];
  }

  /**
   * @returns all enum values IF the core type is an enum. Returns an empty array otherwise.
   */
  get enumValues(): Array<string> {
    if (this.isEnum) {
      return this.library.getEnumValues(this.type.name);
    }
    return [];
  }

  get enumDescriptions(): string[] {
    if (this.isEnum) {
      return this.library.getEnumDescriptions(this.type.name);
    }
    return [];
  }

  /**
   * Returns all the values for this type, assuming it is an Enum. This method is used to
   * dereference Foo into FooInfo, the CoreType convention of keying a detailed info object by
   * an enumerated value.
   */
  getEnumInfoValues<T>(): T[] {
    if (!this.isEnum) {
      throw new IllegalArgumentError(`${this.name} is not an enum`);
    }
    if (!this.type.extendedInfoType) {
      return [];
    }
    return this.library.getEnumInfoValues(
      this.type.name,
      this.type.extendedInfoType,
      this.type.path,
      this.type.extendedInfoValues
    );
  }

  getEnumMember(keyOrValue: string): {
    key: string,
    value: string,
    description?: string;
  } | undefined {
    if (this.isEnum) {
      return this.library.getEnumMember(this.type.name, keyOrValue);
    }
    return undefined;
  }

  private static dereference(ref: string): { name: string, schema: unknown; } | null {
    try {
      // eslint-disable-next-line unicorn/no-array-callback-reference -- CoreType.find is not Array.find
      const ct = CoreType.find(ref);
      const prop: { name: string, schema: unknown; } = {
        name: ct.name,
        schema: ct.schema,
      };
      return prop;
    } catch (e) {
      // no core type
    }
    return null;
  }

  /**
   * Dereferences a schema and all of its sub-schemas expanding `$refs`.
   * * `allOf` schemas are merged into a single `type: object` schema provided all elements are object typed.
   * * `anyOf` and `oneOf` arrays are kept intact. however, schemas will be dereferenced as normal
   * * All properties in a `type` object are expanded and dereferenced when appropriate.
   * * `$refs` are dereferenced and assigned a `name` and a schema.
   *   * `name`: the name of the CoreType.
   *   * `schema`: the dereferenced schema of said Coretype
   * @param schema
   */
  private dereferenceSchema(schema: any): void {
    const anyOfOneOfKey = Object.keys(schema)
      .find((key) => key === 'anyOf' || key === 'oneOf');
    if (schema.allOf) {
      // merge objects
      let sch = {};
      for (const subschema of schema.allOf) {
        this.dereferenceSchema(subschema);
        const derefed = subschema.schema || subschema;
        if (derefed.type !== 'object') {
          throw new UnexpectedError(
            `Unsupported schema ${subschema.type || JSON.stringify(subschema)}`
          );
        }
        sch = mergeSchemas(sch, derefed);
      }
      delete schema.allOf;
      Object.assign(schema, sch);
    } else if (anyOfOneOfKey) {
      const schs = schema[anyOfOneOfKey].map((subschema) => {
        this.dereferenceSchema(subschema);
        return subschema;
      });
      schema[anyOfOneOfKey] = schs;
    } else if (schema.$ref) {
      let deref = isTopLevelRef(schema.$ref)
        ? defaultSchema(this.name)
        : CoreType.dereference(schema.$ref);

      // try a direct library lookup
      if (!deref) {
        // try to dereference FooModel_allOf -> FooModelAllOf
        const parts = schema.$ref.split('/');
        let name = parts.at(-1);
        if (schema.$ref.includes('_')) {
          const splits = parts.at(-1).split('_');
          name = `${splits[0]}${splits[1].slice(0, 1).toUpperCase()}${splits[1].slice(1)}`;
        }
        const directSchema = this.library.getSchema(name);
        this.dereferenceSchema(directSchema);
        if (directSchema) {
          deref = {
            name,
            schema: directSchema,
          };
        }
      }
      if (deref) {
        delete schema.$ref;
        schema.name = deref.name;
        schema.schema = deref.schema;
      }
    } else if (schema.type === 'array' && schema.items.$ref) {
      const deref = isTopLevelRef(schema.items.$ref)
        ? defaultSchema(this.name)
        : CoreType.dereference(schema.items.$ref);
      if (deref) {
        delete schema.items.$ref;
        schema.items.name = deref.name;
        schema.items.schema = deref.schema;
      }
    } else if (schema.type === 'array' && schema.items) {
      this.dereferenceSchema(schema.items);
    } else if (schema.type === 'object' && schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        const nestedProperty = schema.properties[key];
        this.dereferenceSchema(nestedProperty);
      }
    }
  }

  get schema(): Record<string, unknown> {
    if (!this._schema) {
      this._schema = this.library.getSchema(this.type.name);
      if (Object.keys(this._schema).length === 0 && this.type.path) {
          const splits = this.type.path.split('/');
          if (splits.length === 4) {
             
            const fullname = `${splits[2]}${this.type.name.charAt(0).toUpperCase()}${this.type.name.slice(1)}`;
            this._schema = this.library.getSchema(fullname);
          }
        }
      if (this._schema) {
        this.dereferenceSchema(this._schema);
      }
    }
    return this._schema || {};
  }

  /**
   * @param args the arguments to pass to the constructor of the CoreType
   * @returns a new instance of this CoreType
   */
  newInstance<T>(args: any): T {
    let type = this.type.name;
    // For enum types, use the type name directly
    if (this.isEnum) {
      return this.library.newInstance(type, args);
    }
    if (this.path) {
      const pathSplits = this.path.replace('.yml', '').split('/');
      type = '';
      for (let i = pathSplits.length - 1, len = 2; i >= len; i--) {
        if (!type.toLowerCase().startsWith(pathSplits[i].toLowerCase())) {
          type = `${pathSplits[i].charAt(0).toUpperCase()}${pathSplits[i].slice(1)}${type}`;
        }
      }
    }
    return this.library.newInstance(type, args);
  }

  toString(): string {
    let enumStr = '';
    if (this.isEnum) {
      enumStr = '[enum]';
      if (this.hasExtendedInfo) {
        enumStr = '[enum+]';
      }
    }
    return `CoreType ${this.name} [formats=${this.formats}] [jsonType=${this.jsonType}] ${enumStr}
      ${this.pattern ? `[${this.pattern}]` : ''}
    `;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      description: this.description,
      formats: this.formats,
      jsonType: this.jsonType,
      examples: this.examples,
      isEnum: this.isEnum,
      pattern: this.pattern,
    };
  }
}
