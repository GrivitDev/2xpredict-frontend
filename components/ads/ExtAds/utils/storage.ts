const STORAGE_PREFIX =
  'external-ads';

const LAST_SHOWN_KEY =
  `${STORAGE_PREFIX}:last-shown`;

const SESSION_ID_KEY =
  `${STORAGE_PREFIX}:session-id`;

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !==
      'undefined'
  );
}

/**
 * Safely read the timestamp of the last external
 * advertisement shown in this browser.
 */
export function getLastExternalAdShownAt(): number | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const value =
      window.localStorage.getItem(
        LAST_SHOWN_KEY,
      );

    if (!value) {
      return null;
    }

    const timestamp =
      Number(value);

    if (
      !Number.isFinite(timestamp) ||
      timestamp < 0
    ) {
      window.localStorage.removeItem(
        LAST_SHOWN_KEY,
      );

      return null;
    }

    return timestamp;
  } catch {
    return null;
  }
}

/**
 * Persist the time an external advertisement was shown.
 */
export function setLastExternalAdShownAt(
  timestamp = Date.now(),
): void {
  if (!isBrowser()) {
    return;
  }

  if (
    !Number.isFinite(timestamp) ||
    timestamp < 0
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      LAST_SHOWN_KEY,
      String(timestamp),
    );
  } catch {
    // Storage can be unavailable in private/restricted contexts.
  }
}

/**
 * Clear the persisted external-ad timestamp.
 */
export function clearLastExternalAdShownAt(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(
      LAST_SHOWN_KEY,
    );
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Returns a stable identifier for the current
 * browser session.
 */
export function getExternalAdSessionId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const existing =
      window.sessionStorage.getItem(
        SESSION_ID_KEY,
      );

    if (existing) {
      return existing;
    }

    const id =
      createSessionId();

    window.sessionStorage.setItem(
      SESSION_ID_KEY,
      id,
    );

    return id;
  } catch {
    return null;
  }
}

/**
 * Clear the current advertising session identifier.
 */
export function clearExternalAdSession(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      SESSION_ID_KEY,
    );
  } catch {
    // Ignore storage failures.
  }
}

function createSessionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 11)}`;
}


const SESSION_IMPRESSIONS_KEY = `${STORAGE_PREFIX}:session-impressions`;
const DAILY_IMPRESSIONS_PREFIX = `${STORAGE_PREFIX}:daily-impressions`;

function localDayKey(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Session-scoped external provider impressions; in-app campaigns use separate tracking. */
export function getExternalAdSessionImpressionCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const count = Number(window.sessionStorage.getItem(SESSION_IMPRESSIONS_KEY) ?? 0);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch { return 0; }
}

/** Calendar-day external provider impressions for this browser. */
export function getExternalAdDailyImpressionCount(timestamp = Date.now()): number {
  if (typeof window === 'undefined') return 0;
  try {
    const count = Number(window.localStorage.getItem(`${DAILY_IMPRESSIONS_PREFIX}:${localDayKey(timestamp)}`) ?? 0);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch { return 0; }
}

export function recordExternalAdImpression(timestamp = Date.now()): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_IMPRESSIONS_KEY, String(getExternalAdSessionImpressionCount() + 1));
    window.localStorage.setItem(`${DAILY_IMPRESSIONS_PREFIX}:${localDayKey(timestamp)}`, String(getExternalAdDailyImpressionCount(timestamp) + 1));
  } catch {
    // Policy is enforced server-side for available app events; keep provider delivery resilient if storage is blocked.
  }
}
