#!/bin/bash
# Post-process generated code for ESM compatibility

GENERATED_DIR="${1:-generated}"

# Add .js extension to relative imports that don't have it
find "$GENERATED_DIR" -name "*.ts" -type f | while read -r file; do
  # Fix imports from '../../src' to '../../src/index.js'
  sed -i "s|from '../../src'|from '../../src/index.js'|g" "$file"

  # Fix @auditmation package references to @zerobias-org
  sed -i "s|@auditmation/types-core-js|@zerobias-org/types-core-js|g" "$file"
  sed -i "s|@auditmation/types-amazon-js|@zerobias-org/types-amazon-js|g" "$file"
  sed -i "s|@auditmation/types-google-js|@zerobias-org/types-google-js|g" "$file"
  sed -i "s|@auditmation/types-microsoft-js|@zerobias-org/types-microsoft-js|g" "$file"
done

echo "ESM fixes applied to $GENERATED_DIR"
