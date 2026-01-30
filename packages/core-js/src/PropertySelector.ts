/**
 * PropertySelector - Utility for selecting specific properties from objects using dot notation.
 *
 * Supports:
 * - Top-level property selection: ["name", "email"]
 * - Nested property selection: ["contact.phone", "address.city"]
 * - Fuzzy field name matching: "email" matches "e-mail", "email_address", "emailAddress"
 * - Empty/undefined properties returns full object (backward compatible)
 *
 * @example
 * ```typescript
 * const selector = new PropertySelector();
 *
 * const data = {
 *   name: 'John',
 *   email: 'john@example.com',
 *   contact: { phone: '123', address: '456 Main St' }
 * };
 *
 * // Select specific properties
 * selector.select(data, ['name', 'contact.phone']);
 * // Returns: { name: 'John', contact: { phone: '123' } }
 *
 * // Fuzzy matching
 * const data2 = { 'e-mail': 'john@example.com' };
 * selector.select(data2, ['email']);
 * // Returns: { 'e-mail': 'john@example.com' }
 * ```
 */
export class PropertySelector {
  /**
   * Select specific properties from an object using dot notation paths.
   *
   * @param obj - The source object to select properties from
   * @param properties - Array of property paths (e.g., ["name", "contact.phone"])
   * @returns New object containing only the selected properties
   *
   * @remarks
   * - Empty or undefined properties array returns the full object (backward compatible)
   * - Non-existent properties are silently ignored
   * - Null/undefined source returns undefined
   */
  select(obj: any, properties?: string[]): any {
    // Return full object if no properties specified (backward compatible)
    if (!properties || properties.length === 0) {
      return obj;
    }

    // Handle null/undefined input
    if (obj === null || obj === undefined) {
      return obj;
    }

    const result: any = {};

    for (const prop of properties) {
      if (prop.includes('.')) {
        // Nested property (e.g., "contact.phone")
        this.selectNestedProperty(obj, result, prop);
      } else {
        // Top-level property (e.g., "email")
        this.selectTopLevelProperty(obj, result, prop);
      }
    }

    return result;
  }

  /**
   * Select a top-level property from source to target using fuzzy matching.
   *
   * @param source - Source object to read from
   * @param target - Target object to write to
   * @param requested - The requested property name
   */
  private selectTopLevelProperty(
    source: any,
    target: any,
    requested: string
  ): void {
    if (typeof source !== 'object' || source === null) {
      return;
    }

    // Find matching field with fuzzy matching
    for (const [key, value] of Object.entries(source)) {
      if (this.matchesField(requested, key)) {
        target[key] = value;
        return;
      }
    }
  }

  /**
   * Select a nested property from source to target using dot notation path.
   *
   * @param source - Source object to read from
   * @param target - Target object to write to
   * @param path - Dot notation path (e.g., "contact.phone.mobile")
   */
  private selectNestedProperty(
    source: any,
    target: any,
    path: string
  ): void {
    if (typeof source !== 'object' || source === null) {
      return;
    }

    const parts = path.split('.');
    const parentKey = parts[0];
    const childPath = parts.slice(1).join('.');

    // Find parent object with fuzzy matching
    for (const [key, value] of Object.entries(source)) {
      if (this.matchesField(parentKey, key)) {
        if (typeof value === 'object' && value !== null) {
          // Check if the child property exists before creating parent
          const childExists = this.hasProperty(value, childPath);
          if (!childExists) {
            return;
          }

          // Initialize parent in target if not exists
          if (!target[key]) {
            target[key] = Array.isArray(value) ? [] : {};
          }

          if (parts.length === 2) {
            // Direct child property (e.g., path was "contact.phone")
            this.selectTopLevelProperty(value, target[key], childPath);
          } else {
            // Deeper nested property (e.g., path was "contact.phone.mobile")
            this.selectNestedProperty(value, target[key], childPath);
          }
        }
        return;
      }
    }
  }

  /**
   * Check if a property exists in an object (with fuzzy matching).
   *
   * @param obj - Object to check
   * @param path - Property path (can be nested with dots)
   * @returns True if property exists
   */
  private hasProperty(obj: any, path: string): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (path.includes('.')) {
      const parts = path.split('.');
      const parentKey = parts[0];
      const childPath = parts.slice(1).join('.');

      for (const [key, value] of Object.entries(obj)) {
        if (this.matchesField(parentKey, key)) {
          return this.hasProperty(value, childPath);
        }
      }
      return false;
    }

    // Top-level property check
    for (const key of Object.keys(obj)) {
      if (this.matchesField(path, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a requested field name matches an available field name.
   * Uses normalized comparison for fuzzy matching.
   *
   * @param requested - The field name requested by the user
   * @param available - The actual field name in the object
   * @returns True if the fields match (exact or fuzzy)
   *
   * @example
   * ```typescript
   * matchesField("email", "email")        // true - exact
   * matchesField("email", "e-mail")       // true - hyphen removed
   * matchesField("email", "email_addr")   // false - different words
   * matchesField("firstName", "first_name") // true - normalized
   * ```
   */
  matchesField(requested: string, available: string): boolean {
    return (
      this.normalizeFieldName(requested) === this.normalizeFieldName(available)
    );
  }

  /**
   * Normalize a field name for comparison.
   *
   * Normalization rules:
   * 1. Convert to lowercase
   * 2. Remove separators: hyphens (-), underscores (_), spaces
   * 3. Flatten camelCase: "firstName" → "firstname"
   *
   * @param field - The field name to normalize
   * @returns Normalized field name
   *
   * @example
   * ```typescript
   * normalizeFieldName("email")         // "email"
   * normalizeFieldName("e-mail")        // "email"
   * normalizeFieldName("email_address") // "emailaddress"
   * normalizeFieldName("emailAddress")  // "emailaddress"
   * normalizeFieldName("First Name")    // "firstname"
   * ```
   */
  normalizeFieldName(field: string): string {
    return field
      .toLowerCase()
      .replace(/[\s_-]/g, ''); // Remove hyphens, underscores, spaces
  }

  /**
   * Select properties from an array of objects.
   *
   * @param items - Array of objects to process
   * @param properties - Array of property paths to select
   * @returns Array of objects with only selected properties
   */
  selectFromArray<T>(items: T[], properties?: string[]): any[] {
    if (!properties || properties.length === 0) {
      return items;
    }

    return items.map((item) => this.select(item, properties));
  }
}
