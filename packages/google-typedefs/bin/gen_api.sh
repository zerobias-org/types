#!/bin/bash

TARGET=models.yml

cp api.yml $TARGET

for m in $(find schema -type f -print | sort); do

  name=$(basename $m .yml)

  if [[ $name == *"Param" || $name == *"Header" || $name == "pagedResults" || $name == "changeEvent" ]]; then
    echo "ignoring $name"
    continue
  fi

  name="$(tr '[:lower:]' '[:upper:]' <<< ${name:0:1})${name:1}"

  prefix=$(dirname $m)
  prefix=${prefix#schema}
  prefix=${prefix##*\/} # not sure why I have to do this as a separate replacement... (longest matching for compatibility with MacOs)
  prefix="$(tr '[:lower:]' '[:upper:]' <<< ${prefix:0:1})${prefix:1}"

  fullname=${prefix}${name#${prefix}}

  # echo "Model: prefix=${prefix} name=${name} fullname=${fullname}"

  yq e -i .components.schemas.${fullname}.\$ref='"'./${m}'"' $TARGET

done
