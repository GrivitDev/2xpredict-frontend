import type { QueryParams } from '@/types/common';

/**
 * Removes empty query values and normalizes Date values before sending them
 * through Axios. Arrays and objects are intentionally excluded: endpoint query
 * DTOs must define scalar query parameters explicitly.
 */
export function compactQuery<TQuery extends object>(
  query?: TQuery | null,
): QueryParams {
  if (!query) return {};

  const result: QueryParams = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;

    if (value instanceof Date) {
      if (!Number.isNaN(value.getTime())) {
        result[key] = value.toISOString();
      }
      continue;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[key] = value;
    }
  }

  return result;
}

export function encodePathPart(value: string): string {
  return encodeURIComponent(value.trim());
}
