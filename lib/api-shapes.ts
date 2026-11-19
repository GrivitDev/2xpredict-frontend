export type ApiRecord = Record<string, any>;

export function asRecord(value: unknown): ApiRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

export function firstValue(
  record: ApiRecord | null | undefined,
  keys: string[],
  fallback: unknown = undefined,
): unknown {
  const source = asRecord(record);

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
}

export function rowsFrom(
  value: unknown,
  keys: string[] = [
    'items',
    'results',
    'rows',
    'data',
    'fixtures',
    'competitions',
    'predictions',
    'markets',
    'tickets',
    'records',
  ],
): ApiRecord[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item) => item && typeof item === 'object',
    ) as ApiRecord[];
  }

  const record = asRecord(value);

  for (const key of keys) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item) => item && typeof item === 'object',
      ) as ApiRecord[];
    }
  }

  const nested = asRecord(record.data);

  for (const key of keys) {
    const candidate = nested[key];

    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item) => item && typeof item === 'object',
      ) as ApiRecord[];
    }
  }

  return [];
}

export function unwrapRecord(value: unknown): ApiRecord {
  const record = asRecord(value);
  const nested = asRecord(record.data);

  return Object.keys(nested).length > 0 ? nested : record;
}

export function text(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

export function numeric(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export function formatDate(
  value: unknown,
  includeTime = true,
): string {
  if (!value) {
    return 'Date not available';
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return includeTime
    ? date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : date.toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
}

export function formatPoints(value: unknown): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(numeric(value));
}

export function makeIdempotencyKey(prefix = 'web'): string {
  const uuid =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}${Math.floor(Math.random() * 1_000_000_000)}`;

  return `${prefix}:${uuid}`.slice(0, 120);
}

export function errorMessage(
  error: unknown,
  fallback = 'The request could not be completed.',
): string {
  const candidate = error as {
    response?: {
      data?: {
        message?: unknown;
      };
    };
    message?: unknown;
  };

  const message =
    candidate?.response?.data?.message ?? candidate?.message;

  if (Array.isArray(message)) {
    return message.map(String).join(', ');
  }

  return typeof message === 'string' && message.trim()
    ? message
    : fallback;
}
