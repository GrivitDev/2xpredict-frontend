const STORAGE_KEY =
  'internal-popup-history';

const VISIT_KEY =
  'internal-popup-visit';

export interface PopupHistoryItem {
  count: number;
  lastSeen: number;
}

export type PopupHistory =
  Record<
    string,
    PopupHistoryItem
  >;

export function getPopupHistory(): PopupHistory {
  if (
    typeof window === 'undefined'
  ) {
    return {};
  }

  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!stored) {
      return {};
    }

    const parsed =
      JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as PopupHistory;
  } catch {
    return {};
  }
}

export function savePopupHistory(
  history: PopupHistory,
) {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history),
    );
  } catch {
    // Storage may be unavailable.
  }
}

export function markPopupSeen(
  adId: string,
) {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  const history =
    getPopupHistory();

  const current =
    history[adId];

  history[adId] = {
    count:
      (current?.count ?? 0) + 1,
    lastSeen:
      Date.now(),
  };

  savePopupHistory(
    history,
  );

  try {
    sessionStorage.setItem(
      VISIT_KEY,
      adId,
    );
  } catch {
    // Storage may be unavailable.
  }
}

export function hasSeenPopup(
  adId: string,
) {
  return Boolean(
    getPopupHistory()[adId],
  );
}

export function shownThisVisit(
  adId: string,
) {
  if (
    typeof window === 'undefined'
  ) {
    return false;
  }

  try {
    return (
      sessionStorage.getItem(
        VISIT_KEY,
      ) === adId
    );
  } catch {
    return false;
  }
}