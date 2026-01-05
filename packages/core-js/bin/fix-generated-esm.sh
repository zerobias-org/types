#!/bin/bash
# Post-process generated code for ESM compatibility

GENERATED_DIR="${1:-generated}"

# Determine sed in-place flag based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed) requires empty string for in-place with no backup
  SED_I=(-i '')
else
  # Linux (GNU sed)
  SED_I=(-i)
fi

# Add .js extension to relative imports that don't have it
while IFS= read -r -d '' file; do
  # Fix imports from '../../src' to '../../src/index.js'
  sed "${SED_I[@]}" "s|from '../../src'|from '../../src/index.js'|g" "$file"

  # Fix @auditmation package references to @zerobias-org
  sed "${SED_I[@]}" "s|@auditmation/types-core-js|@zerobias-org/types-core-js|g" "$file"
  sed "${SED_I[@]}" "s|@auditmation/types-amazon-js|@zerobias-org/types-amazon-js|g" "$file"
  sed "${SED_I[@]}" "s|@auditmation/types-google-js|@zerobias-org/types-google-js|g" "$file"
  sed "${SED_I[@]}" "s|@auditmation/types-microsoft-js|@zerobias-org/types-microsoft-js|g" "$file"
done < <(find "$GENERATED_DIR" -name "*.ts" -type f -print0)

echo "ESM fixes applied to $GENERATED_DIR"
