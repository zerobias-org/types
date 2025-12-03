import { createRequire } from 'node:module';
import { IllegalArgumentError } from './errors/IllegalArgumentError.js';
import { ObjectSerializer, Type } from '../generated/model/index.js';

const require = createRequire(import.meta.url);
const pluralize = require('pluralize');
const { plural } = pluralize;

export class TypeLibrary {
  libraryName: string;

  typeNames: string[] = [];

  types: Record<string, Type> = {};

  primitiveTypeMap: { [index: string]: any; };

  enumTypeMap: { [index: string]: any; };

  deserializer: (data: any, type: string) => any;

  schemaLocator?: (name: string) => string | undefined;

  /**
   * @param libraryName this is the name of the library being loaded. It will generally be of the form `@foo/foo-typedefs`
   * @param libraryTypedefs an array of JSON objects representing all the `Type` definitions in this library
   * @param primitiveTypeMap a mapping of all "primitives" to their classes. This is for anything extending from `StringFormat`, `NumberFormat`, etc.
   * @param enumTypeMap a mapping of all enums to their classes
   * @param deserializer a function which can deserialize all non-primitive, non-enum types in this library
   * @param schemaLocator a function that will return an HTML-encoded JSON string representing the schema for an object
   */
  constructor(
    libraryName: string,
    libraryTypedefs: Record<string, unknown>[],
    primitiveTypeMap: { [index: string]: any; },
    enumTypeMap: { [index: string]: any; },
    deserializer: (data: any, type: string) => any,
    schemaLocator?: (name: string) => string | undefined
  ) {
    this.libraryName = libraryName;
    this.primitiveTypeMap = primitiveTypeMap;
    this.enumTypeMap = enumTypeMap;
    this.deserializer = deserializer;
    this.schemaLocator = schemaLocator;
    for (const jt of libraryTypedefs) {
      const type: Type = ObjectSerializer.deserialize(jt as Record<string, unknown>, 'Type');
      this.typeNames.push(type.name);
      if (this.types[type.name]) {
        throw new IllegalArgumentError(`${type.name} already exists`);
      }
      this.types[type.name] = type;
      if (type.formats) {
        for (const f of type.formats) {
          if (this.types[f]) {
            throw new IllegalArgumentError(`${type.name} already exists`);
          }
          this.types[f] = type;
        }
      }
    }
  }

  listEnumMembers(enumType: string): Array<{
    key: string;
    value: string;
    description?: string;
  }> {
    const e = this.enumTypeMap[enumType];
    if (!e || !e.values) {
      return [];
    }
    return e.values?.map(
      (val) => ({ ...val })
    );
  }

  /**
   * @deprecated
   */
  getEnumMember(enumType: string, keyOrValue: string): {
    key: string,
    value: string,
    description?: string;
  } | undefined {
    if (keyOrValue === '') {
      return undefined;
    }
    return this.listEnumMembers(enumType)
      .find((member) => member.key === keyOrValue
        || member.value === keyOrValue
        || member.value.toString() === keyOrValue);
  }

  /**
   * @param enumType the name of the enum type to retrieve values for
   * @returns an array of `enum` keys as generated.
   */
  getEnumKeys(enumType: string): string[] {
    const e = this.enumTypeMap[enumType];
    if (!e) {
      return [];
    }
    return e.values.map((val) => val.key);
  }

  /**
   * @param enumType the name of the enum type to retrieve values for
   * @returns an array of of `enum` values
   */
  getEnumValues(enumType: string): string[] {
    const e = this.enumTypeMap[enumType];
    if (!e || !e.values) {
      return [];
    }
    return e.values.map((val) => val.value);
  }

  /**
   * @param enumType the name of the enum type to retrieve descriptions for
   * @returns an array of the values of `x-enum-descriptions`, if provided, for the given enum value
   */
  getEnumDescriptions(enumType: string): string[] {
    const e = this.enumTypeMap[enumType];
    if (!e || !e.values) {
      return [];
    }
    return e.values.map((val) => val.description).filter((val) => val !== undefined);
  }

  /**
   * This method is used to dereference Foo into FooInfo, the CoreType convention of keying a
   * detailed info object by an enumerated value.
   *
   * @param enumType the name of the enum type to retrieve Info values for
   * @param infoType the name of the enum info type
   * @param typePath the optional path to the type, if it's nested
   * @param infoModule the name of the info module if it does not match the pluralized version of the enum type
   * @returns all the info object values for this type, assuming it is an Enum.
   */
  getEnumInfoValues<T>(
    enumType: string,
    infoType: string,
    typePath?: string,
    infoModule?: string
  ): T[] {
    const pathSplits = typePath?.replace('schema', 'data').split('/') || [];
     
    const infoPath = `${this.libraryName}/${pathSplits.slice(1, - 1).join('/')}/${infoModule || plural(enumType)}.json`;
     
    const info = require(infoPath);
    return info.map((i: Record<string, unknown>) => this.deserializer(i, infoType));
  }

  getSchema(type: string): Record<string, unknown> {
    const className = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    if (this.schemaLocator) {
      const b64 = this.schemaLocator(className);
      if (b64) {
        const json = Buffer.from(b64, 'base64').toString();
        return JSON.parse(json);
      }
    }
    return {};
  }

  newInstance(type: string, args: any) {
    const className = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    if (this.primitiveTypeMap[className]) {
      return new this.primitiveTypeMap[className](args);
    }
    // enumTypeMap uses lowercase keys
    if (this.enumTypeMap[type]) {
      return this.enumTypeMap[type].from(args);
    }
    return this.deserializer(args, className);
  }
}
