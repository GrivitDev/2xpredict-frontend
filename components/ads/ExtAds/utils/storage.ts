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