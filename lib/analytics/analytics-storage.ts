const VISITOR_KEY = '2xp_analytics_visitor_id';

const SESSION_KEY = '2xp_analytics_session';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface StoredSession {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
}

function createId(prefix: string): string {
  const id =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${id}`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.localStorage.getItem(
    VISITOR_KEY,
  );

  if (existing) {
    return existing;
  }

  const visitorId = createId('visitor');

  window.localStorage.setItem(
    VISITOR_KEY,
    visitorId,
  );

  return visitorId;
}

export function getOrCreateSession(): StoredSession {
  if (typeof window === 'undefined') {
    return {
      sessionId: '',
      startedAt: 0,
      lastActivityAt: 0,
    };
  }

  const now = Date.now();

  const raw = window.localStorage.getItem(
    SESSION_KEY,
  );

  if (raw) {
    try {
      const stored = JSON.parse(
        raw,
      ) as StoredSession;

      const isValid =
        stored.sessionId &&
        Number.isFinite(stored.lastActivityAt) &&
        now - stored.lastActivityAt <=
          SESSION_TIMEOUT_MS;

      if (isValid) {
        const updated: StoredSession = {
          ...stored,
          lastActivityAt: now,
        };

        window.localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(updated),
        );

        return updated;
      }
    } catch {
      // Invalid stored session. A new one will be created.
    }
  }

  const session: StoredSession = {
    sessionId: createId('session'),
    startedAt: now,
    lastActivityAt: now,
  };

  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session),
  );

  return session;
}

export function touchSession(): StoredSession {
  return getOrCreateSession();
}

export function clearAnalyticsSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(
    SESSION_KEY,
  );
}