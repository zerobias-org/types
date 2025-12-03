import { CoreType } from '@zerobias-org/types-core-js';
import '@zerobias-org/types-amazon-js';
import '@zerobias-org/types-microsoft-js';

const ignoreList = ['binary'];

export default function (target) {
  if (typeof target !== "object") {
    return [
      {
        message: 'Value is not an object.',
      },
    ];
  }

  if (typeof target.format !== "string"
    || CoreType.listTypes().includes(target.format)
    || ignoreList.includes(target.format)
  ) {
    return [];
  }

  if (CoreType.allFormats().includes(target.format)) {
    const type = CoreType.get(target.format);
    return [ { message: `${target.format} is not permitted - use ${type.name} instead`, }, ]
  }
  return [ { message: `unknown format: ${target.format}`, }, ];
}
