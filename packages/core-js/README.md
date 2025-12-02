JavaScript (and TypeScript) implementation of `types-core`.

# Structure

## Errors

Well-defined errors can be found in `src/errors/`. Since we are transpiling to ES5, we need to manually set the prototype of `Error` subclasses for `instanceof` to work:

```typescript
  constructor(type: string, value: any) {
    super('Invalid {type}: {value}', 'err.invalid.input', 400, {type, value});
    // Set the prototype explicitly after super
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
```

See [this FAQ](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work) for more information.

Errors need to not use any `CoreType` so as to prevent initialization cycles.

## Types

Types are defined in `src/types/`. These are TypeScript classes which can be used for interpreting the Schemas above in JavaScript code.

## Generated Types

When a new type is added to `types-core`, it must be manually exported from the `types-core-js` `index.ts`.

## Registering A StringFormat type in `types-core`.

Before implementing the actual type as javascript/typescript you will need to register it in `types-core`.
Instructions can be found in the root level [README](../README.md).

To register a StringFormat you must also do the following: 
* Implement a StringFormat type in [src/types](./core/js/src/types)
  * The name of the `class` should be the `UpperCamelCase` version of the type's name
  * i.e. `src/types/NewType.ts`
* Implement unit tests for the new type in [test](./core/js/test)
  * i.e. `test/NewTypeTest.ts`
* Add your type in [CoreTypesTest.ts](./test/CoreTypesTest.ts)

You may leverage functionality from the new `CoreType` type to extract *description/examples* which will be discussed below.

*Example Type:*

```
{
  "name": "ipAddress",
  "format": "ip",
  "jsonType": "string",
  "description": "An IPv4 or IPv6 Address",
  "examples": [
    "127.0.0.1",
    "192.168.42.1",
    "::1",
    "fe80::e2d5:5eff:fe26:d69f"
  ]
}
```

*Example Implementation* : [IpAddress.ts](./src/types/IpAddress.ts)

### Type Mapping

Types can be mapped via OpenAPI `string` `format`. 

The type's `name` and `format` will be defined in [types.json](../core/typedefs/data/types/types.json)

The name of your class must be the capitalized CamelCase of the type's name. 
It can be introspected by external tools via [CoreType](./src/CoreType.ts)'s `className` getter.

*example:*
* `name`   : ipAddress
* `format` : ip
* `Class`  : IpAddress

## Programmatic access to all core types. (types-core-js)

There is a new `CoreType.ts` type in `types-core-js` that enables developers to query the list of all core types and get Metadata for said types.

You do not need to change anything in there, however you will need to update the `listTypes` unit test when creating a new type.

### Usage

There are currently two ways of accessing a *CoreType* type definition:
* Using constructor to inspect `metadata` defined in [types.yml](../typedefs/schema/types.yml)

```typescript
  import { CoreType } from '@zerobias-org/types-core-js'

  // List of all type's names. This is equivalent to all values defined in types.yml
  const types:Array<string> CoreType.listTypes()

  // Creates a CoreType object for an IpAddress
  const coreTypeByName:CoreType = new CoreType('ipAddress');
  
  // Also Creates a CoreType object for an IpAddress (but based on the format rather than the name)
  const coreTypeByFormat:CoreType = new CoreType(undefined, 'ip');
```

* Using static methods to inspect the same metadata but also load the module underneath.

```typescript
  import { CoreType } from '@zerobias-org/types-core-js'

  // Creates a CoreType object for an IpAddress and loads the module underneath
  const coreTypeByName:CoreType = CoreType.fromType('ipAddress');
  
  // Creates and loads the same type/module using the type's format
  const coreTypeByFormat:CoreType = CoreType.fromFormat('ip');
```

Loading the module as above allows us to dynamically run some of the actual type's code. 
Right now only access to the exported `className` is exposed.

### Unit Tests

`CoreTypeTest`, as it stands, verifies that:
* The list of all types is valid.
* All types in types.ts have a specification in types.json
* All `string-format` types also have a module defined.
  * This is done by attempting to load the actual `ts` module.
