export function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function mapRowToCamel<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  return Object.entries(row).reduce(
    (acc, [key, value]) => {
      acc[snakeToCamelKey(key)] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  ) as T;
}
