export type DisplayMatchStatus =
  | 'UPCOMING'
  | 'IN_PLAY'
  | 'LIVE'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED';

export type MatchStatusSource = {
  status?: string | null;
  statusLabel?: string | null;
  displayClock?: string | null;
} | null | undefined;

function normalized(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function hasStatus(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Resolves a match's display status without treating kickoff as full-time.
 * The kickoff time is only used to move a scheduled/unknown fixture into
 * IN_PLAY. FINISHED is used only when the source explicitly reports a
 * terminal match status.
 */
export function getDisplayMatchStatus(
  presentation?: MatchStatusSource,
  fallbackStatus?: string | null,
  fixtureDate?: string | Date | null,
  now = Date.now(),
): DisplayMatchStatus {
  const presentationStatus = normalized(presentation?.status);
  const raw = !presentationStatus || presentationStatus === 'UNKNOWN'
    ? normalized(fallbackStatus)
    : presentationStatus;

  const kickoff = new Date(String(fixtureDate ?? '')).getTime();
  const hasKickoff = Number.isFinite(kickoff);
  const kickoffPassed = hasKickoff && now >= kickoff;

  // This status is inferred by the shared presentation hook when kickoff has
  // passed but the provider has not supplied a reliable live/terminal status.
  if (presentationStatus === 'IN_PLAY') {
    return 'IN_PLAY';
  }

  if (hasStatus(raw, /POSTPONED/)) return 'POSTPONED';
  if (hasStatus(raw, /CANCELLED|CANCELED|ABANDONED|WALKOVER|NO_CONTEST/)) return 'CANCELLED';
  if (hasStatus(raw, /SUSPENDED|INTERRUPTED/)) return 'SUSPENDED';

  const explicitlyFinished = hasStatus(
    raw,
    /FINISHED|FULL_TIME|FULL TIME|\bFINAL\b|CLOSED|COMPLETED|\bCOMPLETE\b|\bPOST\b|\bFT\b|AFTER_EXTRA_TIME|AFTER_PENALTIES/,
  );
  if (explicitlyFinished) {
    return !hasKickoff || kickoffPassed ? 'FINISHED' : 'UPCOMING';
  }

  // A backend/provider status saying IN_PLAY is an explicit live signal. The
  // internally inferred presentation status above remains IN_PLAY instead.
  if (raw === 'IN_PLAY' || raw === 'IN PLAY') return 'LIVE';
  if (hasStatus(raw, /\bLIVE\b|IN_PROGRESS|IN PROGRESS|HALFTIME|HALF_TIME|FIRST_HALF|SECOND_HALF|EXTRA_TIME|PENALT/)) {
    return 'LIVE';
  }

  if (hasKickoff) return kickoffPassed ? 'IN_PLAY' : 'UPCOMING';
  if (hasStatus(raw, /UPCOMING|SCHEDULED|NOT_STARTED|READY|PUBLISHED|\bPRE\b/)) return 'UPCOMING';
  return 'UPCOMING';
}

export function displayStatusLabel(
  status: DisplayMatchStatus,
  presentation?: MatchStatusSource,
): string {
  if (status === 'LIVE' && presentation?.displayClock) {
    return `LIVE ${presentation.displayClock}`;
  }
  return status === 'IN_PLAY' ? 'IN PLAY' : status.replace(/_/g, ' ');
}

export function displayStatusTone(status: DisplayMatchStatus): string {
  if (status === 'LIVE') {
    return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
  }
  if (status === 'FINISHED') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }
  if (status === 'IN_PLAY') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }
  if (status === 'POSTPONED' || status === 'CANCELLED' || status === 'SUSPENDED') {
    return 'border-border bg-muted/60 text-muted-foreground';
  }
  return 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300';
}

export function displayScore(value: unknown, _status: DisplayMatchStatus): number | string {
  if (value !== null && value !== undefined && value !== '' && typeof value !== 'boolean' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return '—';
}
