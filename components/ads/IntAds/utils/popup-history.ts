const STORAGE_KEY = 'internal-popup-history';

const VISIT_KEY = 'internal-popup-visit';

export interface PopupHistoryItem {
  count: number;
  lastSeen: number;
}

export type PopupHistory = Record<
  string,
  PopupHistoryItem
>;

export function getPopupHistory(): PopupHistory {

  if (typeof window === 'undefined') {

    return {};

  }

  try {

    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    );

  } catch {

    return {};

  }

}

export function savePopupHistory(
  history: PopupHistory,
) {

  if (typeof window === 'undefined') {

    return;

  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history),
  );

}

export function markPopupSeen(
  adId: string,
) {

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

  savePopupHistory(history);

  sessionStorage.setItem(
    VISIT_KEY,
    adId,
  );

}

export function hasSeenPopup(
  adId: string,
) {

  return !!getPopupHistory()[adId];

}

export function shownThisVisit(
  adId: string,
) {

  if (typeof window === 'undefined') {

    return false;

  }

  return (
    sessionStorage.getItem(
      VISIT_KEY,
    ) === adId
  );

}